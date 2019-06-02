const { TxOp } = require('icetea-common')

function _serializeData (address, method, params = [], options = {}) {
  var formData = {}
  var txData = {
    op: TxOp.CALL_CONTRACT,
    name: method,
    params: params
  }
  formData.from = options.from || ''
  formData.payer = options.payer || ''
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
      this.address = address.address || address.returnValue
      this.hash = address.hash
      this.height = address.height
    }
    const contractAddr = this.address

    this.methods = new Proxy({}, {
      get (obj, method) {
        return function (...params) {
          return {
            call: function (options = {}) {
              return tweb3.callReadonlyContractMethod(contractAddr, method, params, Object.assign({}, this.options, options))
            },
            callPure: function (options = {}) {
              return tweb3.callPureContractMethod(contractAddr, method, params, Object.assign({}, this.options, options))
            },
            getMetadata: function () {
              return tweb3.getMetadata(params)
            },
            sendAsync: function (options = {}) {
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(contractAddr, method, params, opts)
              return tweb3.sendTransactionAsync(tx, opts)
            },
            sendSync: function (options = {}) {
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(contractAddr, method, params, opts)
              return tweb3.sendTransactionSync(tx, opts)
            },
            sendCommit: function (options = {}) {
              var opts = Object.assign({}, this.options, options)
              var tx = _serializeData(contractAddr, method, params, opts)
              return tweb3.sendTransactionCommit(tx, opts)
            }
          }
        }
      }
    })

    this.events = new Proxy({}, {
      get (obj, eventName) {
        return function (options, callback) {
          let opts
          if (typeof options === 'function' && typeof callback === 'undefined') {
            callback = options
          } else {
            opts = options
          }
          opts = opts || {}
          opts.where = opts.where || []

          // add address filter
          const EVENTNAMES_SEP = '|'
          const EMITTER_EVENTNAME_SEP = '%'
          const EVENTNAME_INDEX_SEP = '~'
          const emitter = EVENTNAMES_SEP + contractAddr + EMITTER_EVENTNAME_SEP
          opts.where.push(`EventNames CONTAINS '${emitter}${eventName}${EVENTNAMES_SEP}'`)

          // add indexed field filter
          const filter = opts.filter || {}
          Object.keys(filter).forEach(key => {
            const value = filter[key]
            opts.where.push(`${contractAddr}${EMITTER_EVENTNAME_SEP}${eventName}${EVENTNAME_INDEX_SEP}${key}=${value}`)
          })

          return tweb3.subscribe('Tx', opts, (err, result) => {
            if (err) {
              return callback(err)
            }

            // because we support one contract emit the same event only once per TX
            // so r.events must be 0-length for now
            return callback(undefined, result.events[0].eventData, result)
          })
        }
      }
    })
  }
}

module.exports = Contract
