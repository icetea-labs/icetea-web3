const { IceteaWeb3 } = require('../src/index.js')

exports.switchEncoding = function (text, from, to) {
  const buf = Buffer.isBuffer(text) ? text : Buffer.from(text, from)
  return buf.toString(to)
}

exports.web3 = {
  default: function () {
    return exports.web3.http()
  },
  http: function () {
    return new IceteaWeb3('http://localhost:26657')
  },
  ws: function () {
    return new IceteaWeb3('ws://localhost:26657/websocket')
  }
}

exports.newAccounWithBalance = async (tweb3, intialBalance = 100) => {

  const account = tweb3.wallet.createBankAccount()
  // get some money from faucet
  await tweb3.contract('system.faucet').prepareMethod('request').send()

  return account
}

exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
