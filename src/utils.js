const { codec } = require('@iceteachain/common')

exports.tryParseJson = (p) => {
  try {
    return JSON.parse(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return p
  }
}

exports.tryJsonStringify = (p) => {
  if (typeof p === 'string') {
    return p
  }

  try {
    return JSON.stringify(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return String(p)
  }
}

exports.isRegularAccount = codec.isRegularAddress
exports.isBankAccount = codec.isBankAddress

/**
 * Encode tx object to be sent to tendermint.
 * @returns {string} encoded string.
 */
exports.encodeTX = (txObj, enc = 'base64') => {
  return codec.encode(txObj).toString(enc)
}

/**
 * Decode tx encoded string, obtained from tendermint when querying for transaction.
 * @returns {object} the tx object.
 */
exports.decodeTxContent = (data, enc = 'base64') => {
  return codec.decode(Buffer.from(data, enc))
}

exports.ensureBuffer = (buf, enc) => {
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf, enc)
}

exports.switchEncoding = (str, from, to) => {
  return exports.ensureBuffer(str, from).toString(to)
}

exports.decodeTxEvents = (tx) => {
  const EMITTER_EVENTNAME = '_ev'
  const EMPTY_RESULT = []

  const b64Events = _getFieldValue(tx, 'events') || tx
  if (!b64Events.length) {
    return EMPTY_RESULT
  }

  // decode events
  const events = b64Events.map(({ type, attributes }) => {
    return {
      type,
      attributes: attributes.reduce((data, { key, value }) => {
        key = this.switchEncoding(key, 'base64', 'utf8')
        value = this.switchEncoding(value, 'base64', 'utf8')
        data[key] = this.tryParseJson(value)
        return data
      }, {})
    }
  })

  return events.map(({ type, attributes }) => {
    const eventName = attributes[EMITTER_EVENTNAME]
    eventName && delete attributes[EMITTER_EVENTNAME]
    return { emitter: type, eventName, eventData: attributes }
  })
}

exports.decodeTxResult = (srcTx) => {
  const tx = Object.assign({}, srcTx)
  tx.returnValue = this.decodeTxReturnValue(tx)
  if (tx.tx) tx.tx = this.decodeTxContent(tx.tx)
  tx.events = this.decodeEventData(tx)
  return tx
}

exports.decodeTxReturnValue = (tx) => {
  let data = _getFieldValue(tx, 'data')
  if (data) {
    data = codec.decode(Buffer.from(data, 'base64'))
  }
  
  return data
}

exports.removeItem = (array, item) => {
  const index = array.indexOf(item)
  return index >= 0 ? array.splice(index, 1) : array
}

exports.escapeQueryValue = (value) => {
  if (typeof value === 'number') return value
  // escape all single quotes
  return "'" + String(value).replace(/'/g, "\\'") + "'"
}

const _getFieldValue = (obj, level2, level1Fields = ['tx_result', 'deliver_tx']) => {
  const level1 = level1Fields.find(f => f in obj)
  return level1 ? obj[level1][level2] : undefined
}
