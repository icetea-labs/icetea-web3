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

function _sendTx (instance, options, sendMode, { contractAddr, method, params }) {
  const opts = Object.assign({}, instance.options, options || {})
  const tx = _serializeData(contractAddr, method, params, opts)
  return instance.web3.sendTransaction(tx, opts, sendMode)
}

async function _registerEvents (tweb3, contractAddr, eventName, options, callback, once) {
  if (contractAddr.indexOf('.') >= 0 && contractAddr.indexOf('system.') !== 0) {
    const err = new Error('To subscribe to event, you must resolve contract alias first.')
    callback(err)
    return
  }

  let opts
  if (typeof options === 'function' && typeof callback === 'undefined') {
    callback = options
  } else {
    opts = Object.assign({}, options)
  }
  opts = opts || {}

  opts.rawFilter = typeof opts.rawFilter === 'string' ? [opts.rawFilter] : (opts.rawFilter || [])
  opts.rawFilter.map(w => {
    const prefix = contractAddr + '.'
    return w.startsWith(prefix) ? w : (prefix + w)
  })

  const isAll = ['allEvents', '*'].includes(eventName)
  if (isAll) {
    opts.rawFilter.push(`${contractAddr}._ev EXISTS`)
  } else {
    opts.rawFilter.push(`${contractAddr}._ev=${escapeQueryValue(eventName)}`)
  }

  // add indexed field filter
  const filter = opts.filter || {}
  delete opts.filter
  const filterKeys = Object.keys(filter)
  filterKeys.forEach(key => {
    const value = escapeQueryValue(filter[key])
    opts.rawFilter.push(`${contractAddr}.${key}=${value}`)
  })

  let handle
  return tweb3.subscribe('Tx', opts, (err, result) => {
    if (err) {
      callback(err)
      once && handle && handle.off && handle.off()
      return
    }

    const tx = result.data.value.TxResult
    const evs = tx.events
    let called = false
    evs.forEach(e => {
      if (e.emitter === contractAddr && (isAll || e.eventName === eventName)) {
        if (once && called) return
        called = true
        callback(undefined, e, tx)
      }
    })

    once && handle && handle.off && handle.off()
  }).then(r => {
    handle = { off: r.unsubscribe }
    return handle
  })
}

// contract
class Contract {
  constructor (tweb3, address, options = {}) {
    if (!address) {
      throw new Error('Contract address is required.')
    }

    const self = this

    this.web3 = tweb3
    this.options = options // default options

    if (typeof address === 'string') {
      this.address = address
    } else {
      this.address = address.address || address.returnValue
      this.hash = address.hash
      this.height = address.height
      this.deployTxResult = address
    }

    if (this.address !== 'system' && this.address.indexOf('.') < 0) {
      ecc.validateAddress(this.address)
    }

    const contractAddr = this.address

    this.getBalance = function() {
      return tweb3.getBalance(contractAddr)
    }

    this.getMetadata = function (contractAddr) {
      return tweb3.getMetadata(contractAddr)
    }

    this.prepareMethod = function (method, ...params) {
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
          return _sendTx(self, options, 'async', { contractAddr, method, params })
        },
        sendSync: function (options = {}) {
          return _sendTx(self, options, 'sync', { contractAddr, method, params })
        },
        sendCommit: function (options = {}) {
          return _sendTx(self, options, 'commit', { contractAddr, method, params })
        },
        send: function (options = {}) {
          return _sendTx(self, options, undefined, { contractAddr, method, params })
        }
      }
    }

    this.methods = new Proxy({}, {
      get (obj, method) {
        return function (...params) {
          return self.prepareMethod(method, ...params)
        }
      }
    })

    this.on = function (eventName, options, callback) {
      return _registerEvents(tweb3, contractAddr, eventName, options, callback)
    }

    this.once = function (eventName, options, callback) {
      return _registerEvents(tweb3, contractAddr, eventName, options, callback, true)
    }

    this.events = new Proxy({}, {
      get (obj, eventName) {
        return function (options, callback) {
          return _registerEvents(tweb3, contractAddr, eventName, options, callback)
        }
      }
    })

    this.getPastEvents = function (eventName, conditions, options) {
      return tweb3.getContractEvents(contractAddr, eventName, conditions, options)
    }
  }
}

module.exports = Contract
