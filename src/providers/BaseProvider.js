const { switchEncoding, encodeTX, tryParseJson } = require('../utils')

class BaseProvider {
  sanitizeParams (params) {
    params = params || {}
    Object.keys(params).forEach(k => {
      let v = params[k]
      if (typeof v === 'number') {
        params[k] = String(v)
      }
    })
    return params
  }

  _call (method, params) {}

  // call a jsonrpc, normally to query blockchain (block, tx, validator, consensus, etc.) data
  call (method, params) {
    return this._call(method, params).then(resp => {
      if (resp.error) {
        const err = new Error(resp.error.message)
        Object.assign(err, resp.error)
        throw err
      }
      if (resp.id) resp.result.id = resp.id
      return resp.result
    })
  }

  // query application state (read)
  query (path, data, options) {
    const params = { path, ...options }
    if (data) {
      if (typeof data !== 'string') {
        data = JSON.stringify(data)
      }
      params.data = switchEncoding(data, 'utf8', 'hex')
    }

    return this._call('abci_query', params).then(resp => {
      if (resp.error) {
        const err = new Error(resp.error.message)
        Object.assign(err, resp.error)
        throw err
      }

      // decode query data embeded in info
      let r = resp.result
      if (r && r.response && r.response.info) {
        r = tryParseJson(r.response.info)
      }
      return r
    })
  }

  // send a transaction (write)
  send (method, tx) {
    return this.call(method, {
      // for jsonrpc, encode in 'base64'
      // for query string (REST), encode in 'hex' (or 'utf8' inside quotes)
      tx: encodeTX(tx, 'base64')
    }).then(result => {
      if (result.code) {
        const err = new Error(result.log)
        Object.assign(err, result)
        throw err
      }

      return result
    })
  }
}

module.exports = BaseProvider
