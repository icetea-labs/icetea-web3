const { encodeTX, tryJsonStringify } = require('../utils')
const { codec } = require('@iceteachain/common')

class BaseProvider {
  constructor (endpoint, options, defOptions) {
    this.endpoint = endpoint
    this.options = Object.assign({}, defOptions || {}, options || {})
  }

  sanitizeParams (params) {
    params = params || {}
    Object.keys(params).forEach(k => {
      const v = params[k]
      if (typeof v === 'number') {
        params[k] = String(v)
      }
    })
    return params
  }

  _call (method, params) {
    throw new Error('BaseProvider._call is not implemented.')
  }

  // call a jsonrpc, normally to query blockchain (block, tx, validator, consensus, etc.) data
  call (method, params) {
    return this._call(method, params).then(resp => {
      if (resp.error) {
        const err = new Error(resp.error.data || resp.error.message)
        err.error = resp.error
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
      params.data = encodeTX(data, 'hex')
    }

    return this.call('abci_query', params).then(result => {
      const r = result.response

      if (r.code) {
        const err = new Error(tryJsonStringify((r.info && r.info.message) || r.info || r.log || data))
        err.code = r.code
        err.info = r.info
        err.log = r.log
        throw err
      }

      return codec.decode(Buffer.from(r.value, 'base64'))
    })
  }

  // send a transaction (write)
  send (method, tx) {
    return this.call(method, {
      // for jsonrpc, encode in 'base64'
      // for query string (REST), encode in 'hex' (or 'utf8' inside quotes)
      tx: encodeTX(tx, 'base64')
    }).then(result => {
      const code = result.code || (result.check_tx && result.check_tx.code) || (result.deliver_tx && result.deliver_tx.code)
      if (code) {
        const log = result.log || (result.check_tx && result.check_tx.log) || (result.deliver_tx && result.deliver_tx.log)
        throw Object.assign(new Error(log), result)
      }

      return result
    })
  }
}

module.exports = BaseProvider
