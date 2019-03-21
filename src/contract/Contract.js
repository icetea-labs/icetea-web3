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

class Contract {
  constructor (tweb3, address, privateKey) {
    // this.iweb3 = iweb3;
    // this.address = address;
    this.methods = new Proxy({}, {
      get: function (obj, method) {
        return {
          call: function (params = [], options = {}) {
            return tweb3.callReadonlyContractMethod(address, method, params, options)
          },
          callPure: function (params = [], options = {}) {
            return tweb3.callPureContractMethod(address, method, params, options)
          },
          sendAsync: function (params, options) {
            var tx = _serializeData(address, method, params, options)
            return tweb3.sendTransactionAsync(tx, privateKey)
          },
          sendSync: function (params, options) {
            var tx = _serializeData(address, method, params, options)
            return tweb3.sendTransactionSync(tx, privateKey)
          },
          sendCommit: function (params, options) {
            var tx = _serializeData(address, method, params, options)
            return tweb3.sendTransactionCommit(tx, privateKey)
          }
        }
      },
      set: function () {
        throw new Error('Cannot change methods.')
      }
    })
  }
}

module.exports = Contract
