const { TxOp } = require('icetea-common')

function _serializeData (address, method, params = [], options = {}) {
  var formData = {}
  var txData = {
    op: TxOp.CALL_CONTRACT,
    name: method,
    params: params
  }
  formData.to = address
  formData.value = options.value || 0
  formData.fee = options.fee || 0
  formData.data = txData
  return formData
}

// contract
class Contract {
  constructor (tweb3, address, options = {}) {
    this.options = options // default options
    this.methods = new Proxy({}, {
      get (obj, method) {
        return function (...params) { // ...params
          return {
            call: function (options = {}) {
              return tweb3.callReadonlyContractMethod(address, method, params, Object.assign({}, this.options, options))
            },
            callPure: function (options = {}) {
              return tweb3.callPureContractMethod(address, method, params, Object.assign({}, this.options, options))
            },
            getMetadata: function () {
              return tweb3.getMetadata(params)
            },
            sendAsync: function (options = {}) {
              var tx = _serializeData(address, method, params, Object.assign({}, this.options, options))
              var privateKey = tweb3.wallet.getAccountByAddress(options.from).privateKey
              return tweb3.sendTransactionAsync(tx, privateKey)
            },
            sendSync: function (options = {}) {
              var tx = _serializeData(address, method, params, Object.assign({}, this.options, options))
              var privateKey = tweb3.wallet.getAccountByAddress(options.from).privateKey
              return tweb3.sendTransactionSync(tx, privateKey)
            },
            sendCommit: function (options = {}) {
              var tx = _serializeData(address, method, params, Object.assign({}, this.options, options))
              var privateKey = tweb3.wallet.getAccountByAddress(options.from).privateKey
              return tweb3.sendTransactionCommit(tx, privateKey)
            }
          }
        }
      }
    })
  }
}

module.exports = Contract
