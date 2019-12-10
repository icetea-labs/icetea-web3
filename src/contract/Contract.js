const { TxOp, ecc } = require('@iceteachain/common')

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

function _registerEvents (tweb3, contractAddr, eventName, options, callback) {
  if (contractAddr && contractAddr.indexOf('.') >= 0 && contractAddr.indexOf('system.') !== 0) {
    const err = new Error('To subscribe to event, you must resolve contract alias first.')
    return callback(err)
  }

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
  const emitter = (contractAddr ? (EVENTNAMES_SEP + contractAddr) : '') + EMITTER_EVENTNAME_SEP
  const isAll = (eventName === 'allEvents')
  if (isAll) {
    contractAddr && opts.where.push(`EventNames CONTAINS '${emitter}'`)
  } else {
    opts.where.push(`EventNames CONTAINS '${emitter}${eventName}${EVENTNAMES_SEP}'`)
  }

  // add indexed field filter
  const filter = opts.filter || {}
  const filterKeys = Object.keys(filter)
  if (!isAll && filterKeys.length && !contractAddr) {
    const err = new Error('Cannot filter by indexed fields unless the contract address is specified.')
    return callback(err)
  }

  filterKeys.forEach(key => {
    const value = filter[key]
    if (isAll) {
      if (contractAddr) {
        opts.where.push(`${contractAddr}${EMITTER_EVENTNAME_SEP}${key.replace('.', EVENTNAME_INDEX_SEP)}=${value}`)
      } else {
        opts.where.push(`${key.replace('.', EMITTER_EVENTNAME_SEP).replace('.', EVENTNAME_INDEX_SEP)}=${value}`)
      }
    } else {
      // contractAddr should be truthy if reach here
      opts.where.push(`${contractAddr}${EMITTER_EVENTNAME_SEP}${eventName}${EVENTNAME_INDEX_SEP}${key}=${value}`)
    }
  })

  return tweb3.subscribe('Tx', opts, (err, result) => {
    if (err) {
      return callback(err)
    }

    // because we support one contract emit the same event only once per TX
    // so r.events must be 0-length for now
    const evs = result.data.value.TxResult.events
    return callback(undefined, isAll ? evs : evs[0].eventData, result)
  })
}

// contract
class Contract {
  constructor (tweb3, address, options = {}) {
    this.options = options // default options

    if (typeof address === 'string') {
      this.address = address
    } else if (address != null) {
      this.address = address.address || address.returnValue
      this.hash = address.hash
      this.height = address.height
    }

    if (this.address && this.address.indexOf('.') < 0) {
      ecc.validateAddress(this.address)
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
          return _registerEvents(tweb3, contractAddr, eventName, options, callback)
        }
      }
    })
  }
}

module.exports = Contract
