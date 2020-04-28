const { TxOp, ecc } = require('@iceteachain/common')
const { escapeQueryValue } = require('../utils')

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
  if (contractAddr.indexOf('.') >= 0 && contractAddr.indexOf('system.') !== 0) {
    const err = new Error('To subscribe to event, you must resolve contract alias first.')
    return callback(err)
  }

  let opts
  if (typeof options === 'function' && typeof callback === 'undefined') {
    callback = options
  } else {
    opts = Object.assign({}, options)
  }
  opts = opts || {}
  opts.where = opts.where || []

  const isAll = (eventName === 'allEvents')
  if (isAll) {
    opts.where.push(`${contractAddr}._ev EXISTS`)
  } else {
    opts.where.push(`${contractAddr}._ev=${escapeQueryValue(eventName)}`)
  }

  // add indexed field filter
  const filter = opts.filter || {}
  // delete opts.filter
  const filterKeys = Object.keys(filter)
  filterKeys.forEach(key => {
    const value = escapeQueryValue(filter[key])
    opts.where.push(`${contractAddr}.${key}=${value}`)
  })

  return tweb3.subscribe('Tx', opts, (err, result) => {
    if (err) {
      return callback(err)
    }
    const evs = result.data.value.TxResult.events
    const data = isAll ? evs : evs.filter(el => {
      return el.eventName === eventName
    })

    return callback(undefined, data, result)
  })
}

// contract
class Contract {
  constructor (tweb3, address, options = {}) {

    if (!address) {
      throw new Error('Contract address is required.')
    }

    this.options = options // default options

    if (typeof address === 'string') {
      this.address = address
    } else {
      this.address = address.address || address.returnValue
      this.hash = address.hash
      this.height = address.height
    }

    if (this.address !== 'system' && this.address.indexOf('.') < 0) {
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

    this.pastEvents = new Proxy({}, {
      get (obj, eventName) {
        return function (conditions, options) {
          return tweb3.getContractEvents(contractAddr, eventName, conditions, options)
        }
      }
    })
  }
}

module.exports = Contract
