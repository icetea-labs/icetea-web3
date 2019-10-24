/* global WebSocket */

const BaseProvider = require('./BaseProvider')
const WebsocketAsPromised = require('websocket-as-promised')

const W3CWebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('websocket').w3cwebsocket

class WebsocketProvider extends BaseProvider {
  constructor (endpoint, options) {
    super(endpoint, options, {
      createWebSocket: url => new W3CWebSocket(url),
      packMessage: data => JSON.stringify(data),
      unpackMessage: message => JSON.parse(message),
      attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
      extractRequestId: data => data.id
      // timeout: 10000,
    })
    this.wsp = new WebsocketAsPromised(this.endpoint, this.options)
  }

  close () {
    this.wsp.close()
  }

  registerEventListener (event, callback) {
    this.wsp[event].addListener(callback)
  }

  _call (method, params) {
    const json = {
      jsonrpc: '2.0',
      method,
      params: this.sanitizeParams(params)
    }

    if (!this.wsp.isOpened) {
      return this.wsp.open().then(() => this.wsp.sendRequest(json))
    }

    return this.wsp.sendRequest(json)
  }
}

module.exports = WebsocketProvider
