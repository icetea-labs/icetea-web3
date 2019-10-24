/* global fetch */

const BaseProvider = require('./BaseProvider')

const _fetch = typeof fetch !== 'undefined' ? fetch : require('node-fetch')

class HttpProvider extends BaseProvider {
  _call (method, params) {
    const json = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: this.sanitizeParams(params)
    }

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Connection: this.options.keepConnection ? 'keep-alive' : 'close'
      },
      body: JSON.stringify(json)
    }

    if (this.options.signal) {
      fetchOptions.signal = this.options.signal
    }

    return _fetch(this.endpoint, fetchOptions)
      .then(resp => resp.json())
  }
}

module.exports = HttpProvider
