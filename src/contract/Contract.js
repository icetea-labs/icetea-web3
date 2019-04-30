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

    if (typeof address === 'string') {
      this.address = address
    } else {
      this.address = address.address || address.result
      this.hash = address.hash
      this.height = address.height
    }

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
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(address, method, params, opts)
              return tweb3.sendTransactionAsync(tx, opts)
            },
            sendSync: function (options = {}) {
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(address, method, params, opts)
              return tweb3.sendTransactionSync(tx, opts)
            },
            sendCommit: function (options = {}) {
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(address, method, params, opts)
              return tweb3.sendTransactionCommit(tx, opts)
            }
          }
        }
      }
    })
  }
}

module.exports = Contract
