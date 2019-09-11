const { codec } = require('@iceteachain/common')

exports.tryParseJson = p => {
  try {
    return JSON.parse(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return p
  }
}

exports.tryJsonStringify = p => {
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
exports.decodeTX = (data, enc = 'base64') => {
  return codec.decode(Buffer.from(data, enc))
}

exports.ensureBuffer = (buf, enc) => {
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf, enc)
}

exports.switchEncoding = (str, from, to) => {
  return exports.ensureBuffer(str, from).toString(to)
}

exports.decodeTags = (tx, keepEvents = false) => {
  const EMPTY_RESULT = {}
  const b64Tags = _getFieldValue(tx, 'tags') || tx
  if (!b64Tags.length) {
    return EMPTY_RESULT
  }

  const tags = {}
  // decode tags
  b64Tags.forEach(t => {
    const key = this.switchEncoding(t.key, 'base64', 'utf8')
    const value = this.switchEncoding(t.value, 'base64', 'utf8')
    tags[key] = this.tryParseJson(value)
  })

  if (!keepEvents && tags.EventNames) {
    // remove event-related tags
    const EVENTNAMES_SEP = '|'
    const EMITTER_EVENTNAME_SEP = '%'
    const events = tags.EventNames.split(EVENTNAMES_SEP)
    events.forEach(e => {
      if (e) {
        const eventName = e.split(EMITTER_EVENTNAME_SEP)[1]
        Object.keys(tags).forEach(key => {
          if (key.indexOf(eventName) === 0) {
            delete tags[key]
          }
        })
        delete tags[e]
      }
    })
    delete tags.EventNames
  }

  return tags
}

exports.decodeEventData = (tx) => {
  const EMPTY_RESULT = []

  const tags = this.decodeTags(tx, true)

  if (!tags.EventNames) {
    return EMPTY_RESULT
  }

  const EVENTNAMES_SEP = '|'
  const EMITTER_EVENTNAME_SEP = '%'
  const EVENTNAME_INDEX_SEP = '~'

  const events = tags.EventNames.split(EVENTNAMES_SEP)
  if (!events.length) {
    return EMPTY_RESULT
  }

  const result = events.reduce((r, e) => {
    if (e) {
      const parts = e.split(EMITTER_EVENTNAME_SEP)
      const emitter = parts[0]
      const eventName = parts[1]
      const eventData = Object.keys(tags).reduce((data, key) => {
        const prefix = eventName + EVENTNAME_INDEX_SEP
        if (key.startsWith(prefix)) {
          const name = key.substr(prefix.length)
          const value = tags[key]
          data[name] = value
        } else if (key === eventName) {
          Object.assign(data, tags[key])
        }
        return data
      }, {})
      r.push({ emitter, eventName, eventData })
    }
    return r
  }, [])

  return result
}

exports.decode = (tx, keepEvents = false) => {
  this.decodeReturnValue(tx)
  if (tx.tx) tx.tx = this.decodeTX(tx.tx)
  tx.events = this.decodeEventData(tx)
  tx.tags = this.decodeTags(tx, keepEvents)
  return tx
}

exports.decodeReturnValue = (tx, fieldName = 'returnValue') => {
  const data = _getFieldValue(tx, 'data')
  if (data) {
    tx[fieldName] = codec.decode(Buffer.from(data, 'base64'))
  }

  return tx
}

exports.removeItem = (array, item) => {
  const index = array.indexOf(item)
  return index >= 0 ? array.splice(index, 1) : array
}

const _getFieldValue = (obj, level2, level1Fields = ['tx_result', 'deliver_tx']) => {
  const level1 = level1Fields.find(f => f in obj)
  return level1 ? obj[level1][level2] : undefined
}
