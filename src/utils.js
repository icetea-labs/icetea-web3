const { codec } = require('icetea-common')

exports.replaceAll = (text, search, replacement) => {
  return text.split(search).join(replacement)
}

exports.tryParseJson = p => {
  try {
    return JSON.parse(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return p
  }
}

exports.tryStringifyJson = p => {
  try {
    return JSON.stringify(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return p
  }
}

exports.encodeTX = (data, enc = 'base64') => {
  return codec.encode(data).toString(enc)
}

exports.toBuffer = (text, enc) => {
  return Buffer.from(text, enc)
}

exports.switchEncoding = (str, from, to) => {
  return Buffer.from(str, from).toString(to)
}

exports.decodeTX = (data, enc = 'base64') => {
  return codec.decode(exports.toBuffer(data, enc))
}

exports.decodeTags = (tx, keepEvents = false) => {
  const EMPTY_RESULT = {}
  let b64Tags = tx

  if (tx.data && tx.data.value && tx.data.value.TxResult.result.tags) {
    b64Tags = tx.data.value.TxResult.result.tags // For subscribe
  } else if (tx.tx_result && tx.tx_result.tags) {
    b64Tags = tx.tx_result.tags
  } else if (tx.deliver_tx && tx.deliver_tx.tags) {
    b64Tags = tx.deliver_tx.tags
  }
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
    const events = tags.EventNames.split('|')
    events.forEach(e => {
      if (e) {
        const eventName = e.split('.')[1]
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

exports.decodeTxResult = (result) => {
  if (!result) return result
  const name = result.tx_result ? 'tx_result' : 'deliver_tx'

  if (result[name] && result[name].data) {
    result[name].data = this.tryParseJson(this.switchEncoding(result[name].data, 'base64', 'utf8'))
  }

  return result
}

exports.decodeEventData = (tx) => {
  const EMPTY_RESULT = []

  const tags = this.decodeTags(tx, true)

  if (!tags.EventNames) {
    return EMPTY_RESULT
  }

  const events = tags.EventNames.split('|')
  if (!events.length) {
    return EMPTY_RESULT
  }

  const result = events.reduce((r, e) => {
    if (e) {
      const parts = e.split('.')
      const emitter = parts[0]
      const eventName = parts[1]
      const eventData = Object.keys(tags).reduce((data, key) => {
        const prefix = eventName + '.'
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