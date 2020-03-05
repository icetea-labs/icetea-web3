const { utils: helper, TxOp, ContractMode } = require('@iceteachain/common')
const {
  switchEncoding,
  decodeTX,
  decodeEventData,
  decodeTags,
  decode,
  decodeReturnValue,
  removeItem,
  isRegularAccount,
  isBankAccount,
  escapeQueryValue
} = require('./utils')
const Contract = require('./contract/Contract')
const Wallet = require('./wallet/Wallet')
const HttpProvider = require('./providers/HttpProvider')
const WebsocketProvider = require('./providers/WebsocketProvider')

const { signTransaction } = helper

exports.utils = {
  decodeTxContent: decodeTX,
  decodeTxReturnValue: decodeReturnValue,
  decodeTxEvents: decodeEventData,
  decodeTxTags: decodeTags,
  decodeTxResult: decode,
  isRegularAccount,
  isBankAccount
}

/**
 * The Icetea web client.
 */
exports.IceteaWeb3 = class IceteaWeb3 {
  /**
   * Initialize the IceTeaWeb3 instance.
   * @param {string} endpoint tendermint endpoint, e.g. http://localhost:26657
   */
  constructor (endpoint, options) {
    this.isWebSocket = !!(endpoint.startsWith('ws://') || endpoint.startsWith('wss://'))
    if (this.isWebSocket) {
      this.rpc = new WebsocketProvider(endpoint, options)
    } else {
      this.rpc = new HttpProvider(endpoint, options)
    }

    this._wssub = {}
    this.wallet = new Wallet()

    this.utils = exports.utils
  }

  close () {
    if (this.isWebSocket) {
      this.rpc.close()
    }
  }

  /**
   * Direct call to tendermint PRC.
   * @param {string} method PRC path.
   * @param {*} options optional querystring object.
   * @return {*} the RPC return value.
   */
  rpcCall (path, options) {
    return this.rpc.call(path, options)
  }

  /**
   * Get blockchain headers.
   * @param {*} options optional, example {minHeight:10, maxHeight:11}
   * @returns block headers, maximum 20 items.
   */
  getBlockHeaders (options) {
    return this.rpc.call('blockchain', options)
  }

  /**
   * Get current status of the blockchain, like last block height, timestamp, etc.
   */
  getBlockchainStatus () {
    return this.rpc.call('status')
  }

  /**
   * Get number of unconfimed txs.
   */
  countUnconfirmedTxs () {
    return this.rpc.call('num_unconfirmed_txs')
  }

  /**
   * Get list of unconfirmed txs.
   */
  getUnconfimedTxs () {
    return this.rpc.call('unconfirmed_txs')
  }

  /**
   * Get a single validators
   * @param {*} options example {height: 10}, skip to get latest block.
   * @returns the validators block.
   */
  getValidators (options) {
    return this.rpc.query('validators', undefined, options)
  }

  /**
   * Get account balance.
   * @param {string} address address of the account.
   * @returns {number} account balance.
   */
  getBalance (address) {
    return this.rpc.query('balance', address)
  }

  /**
   * Get a single block.
   * @param {*} options example {height: 10}, skip to get latest block.
   * @returns the tendermint block.
   */
  getBlock (options) {
    return this.rpc.call('block', options)
  }

  /**
   * Get a list of blocks.
   * @param {*} options optional, e.g. {minHeight: 0, maxHeight: 10}
   * @returns {Array} an array of tendermint blocks
   */
  getBlocks (options) {
    return this.rpc.call('blockchain', options)
  }

  /**
   * Get a single transaction.
   * @param {string} hash required, hex string without '0x'.
   * @param {*} options optional, e.g. {prove: true} to request proof.
   * @return {*} the tendermint transaction.
   */
  getTransaction (hash, options) {
    if (!hash) {
      throw new Error('hash is required')
    }
    return this.rpc.call('tx', { hash: switchEncoding(hash, 'hex', 'base64'), ...options })
      .then(decode)
  }

  /**
   * Search for transactions met the query specified.
   * @param {string} query required, query based on tendermint indexed tags, e.g. "tx.height>0".
   * @param {*} options additional options, e.g. {prove: true, page: 2, per_page: 20}
   * @returns {Array} Array of tendermint transactions.
   */
  searchTransactions (query, options) {
    if (!query) {
      throw new Error('query is required, example "tx.height>0"')
    }
    return this.rpc.call('tx_search', { query, ...options })
  }

  /**
   * Search for events emit by contracts.
   * @param {string} eventName the event name, e.g. "Transferred"
   * @param {string} emitter optional, the contract address, or "system"
   * @param {*} conditions required, string or object literal.
   * string example: "tx.height>0 AND someIndexedField CONTAINS 'kkk'".
   * Object example: {fromBlock: 0, toBlock: 100, address: "xxx", filter: {someIndexedField: "xxx"}, tags: {tx.from: "yyy"}}.
   * Note that conditions are combined using AND, no support for OR.
   * @param {*} options additional options, e.g. {prove: true, page: 2, per_page: 20}
   * @returns {Array} Array of tendermint transactions containing the event.
   */
  getPastEvents (eventName, conditions = {}, options) {
    const EVENTNAMES_SEP = '|'
    const EMITTER_EVENTNAME_SEP = '%'
    const EVENTNAME_INDEX_SEP = '~'

    let query = ''
    if (typeof conditions === 'string') {
      query = conditions
    } else {
      let emitter = conditions.address
      if (!emitter) {
        emitter = EMITTER_EVENTNAME_SEP
      } else {
        if (Array.isArray(emitter)) {
          throw new Error('getPastEvents: mutiple addresses are not supported.')
        }
        emitter = EVENTNAMES_SEP + emitter + EMITTER_EVENTNAME_SEP
      }

      const arr = [`EventNames CONTAINS '${emitter}${eventName}${EVENTNAMES_SEP}'`]

      if (conditions.fromBlock) {
        arr.push(`tx.height>${+conditions.fromBlock - 1}`)
      }

      if (conditions.toBlock) {
        arr.push(`tx.height<${+conditions.fromBlock + 1}`)
      }

      if (conditions.atBlock) {
        arr.push(`tx.height=${conditions.fromBlock}`)
      }

      const filter = conditions.filter || {}
      Object.keys(filter).forEach(key => {
        const value = escapeQueryValue(filter[key])
        if (conditions.address) {
          arr.push(`${conditions.address}${EMITTER_EVENTNAME_SEP}${eventName}${EVENTNAME_INDEX_SEP}${key}=${value}`)
        } else {
          throw new Error('getPastEvents: filter are not supported unless you specify an emitter address.')
        }
      })

      const tags = conditions.tags || {}
      Object.keys(tags).forEach(key => {
        const value = tags[key]
        arr.push(`${key}=${value}`)
      })

      // raw tag conditions, can use >, <, =, CONTAINS
      const where = conditions.where || []
      where.forEach(w => {
        arr.push(w)
      })

      query = arr.join(' AND ')
    }

    return this.searchTransactions(query, options)
  }

  /**
   * @param {boolean} preferAlias whether to prefer alias, or just return address.
   * @return {string[]} Get all deployed smart contracts.
   */
  getContracts (preferAlias) {
    return this.rpc.query('contracts', preferAlias)
  }

  /**
   * Get contract metadata.
   * @param {string} contractAddr the contract address.
   * @returns {string[]} methods and fields array.
   */
  getMetadata (contractAddr) {
    return this.rpc.query('metadata', contractAddr)
  }

  /**
   * Get account info.
   * @param {string} addr  the contract address.
   * @returns {{balance: number, code: string | Buffer, mode: number, deployedBy: string, system: boolean}} Account info.
   */
  getAccountInfo (addr) {
    return this.rpc.query('account_info', addr)
  }

  /**
   * Get contract source.
   * @param {string} contractAddr  the contract address.
   * @returns {string} Contract source code, encoded in base64.
   */
  getContractSource (contractAddr) {
    return this.rpc.query('contract_src', contractAddr)
  }

  /**
   * @private
   */
  getDebugState () {
    return this.rpc.query('state')
  }

  sendTransaction (tx, signers, waitOption) {
    waitOption = waitOption || (signers && signers.waitOption) || 'commit'
    return _signAndSend(this.rpc, tx, 'broadcast_tx_' + waitOption, this.wallet, signers)
  }

  /**
   * Send a transaction and return immediately.
   * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
   * @param {object} signers signers
   */
  sendTransactionAsync (tx, signers) {
    return this.sendTransaction(tx, signers, 'async')
  }

  /**
   * Send a transaction and wait until it reach mempool.
   * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
   * @param {object} signers signers
   */
  sendTransactionSync (tx, signers) {
    return this.sendTransaction(tx, signers, 'sync')
  }

  /**
   * Send a transaction and wait until it is included in a block.
   * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
   * @param {object} signers signers
   */
  sendTransactionCommit (tx, signers) {
    return this.sendTransaction(tx, signers, 'commit')
  }

  signTransaction (tx, signers) {
    return _signTx(tx, this.wallet, signers)
  }

  sendRawTransaction (tx, waitOption = 'commit') {
    return _sendSignedTx(this.rpc, tx, 'broadcast_tx_' + waitOption)
  }

  /**
   * Call a readonly (@view) contract method or field.
   * @param {string} contract required, the contract address.
   * @param {string} method required, method or field name.
   * @param {Array} params method params, if any.
   * @param {*} options optional options, e.g. {from: 'xxx'}
   */
  callReadonlyContractMethod (contract, method, params = [], options = {}) {
    return this.rpc.query('invokeView', { address: contract, name: method, params, options })
  }

  /**
   * Call a pure (@pure) contract method or field.
   * @param {string} contract required, the contract address.
   * @param {string} method required, method or field name.
   * @param {Array} params method params, if any.
   * @param {*} options optional options, e.g. {from: 'xxx'}
   */
  callPureContractMethod (contract, method, params = [], options = {}) {
    return this.rpc.query('invokePure', { address: contract, name: method, params, options })
  }

  /**
   * Return the address, resoving the alias if neccessary.
   * @param {string} addressOrAlias an address or alias
   */
  ensureAddress (addressOrAlias) {
    return this.callReadonlyContractMethod('system.alias', 'resolve', [addressOrAlias]).then(data => data || addressOrAlias)
  }

  /**
     * Subscribes by event (for WebSocket only)
     *
     * @method subscribe
     *
     * @param {MessageEvent} EventName
     */
  subscribe (eventName, conditions = {}, callback) {
    if (!this.isWebSocket) throw new Error('"subscribe" supports only WebSocketProvider.')
    const systemEvents = ['NewBlock', 'NewBlockHeader', 'Tx', 'RoundState', 'NewRound',
      'CompleteProposal', 'Vote', 'ValidatorSetUpdates', 'ProposalString']
    if (eventName && !systemEvents.includes(eventName)) {
      console.warn(`Event ${eventName} is not one of known supported events: ${systemEvents}.`)
    }

    let query = ''
    if (typeof conditions === 'string') {
      query = conditions
    } else {
      if (typeof conditions === 'function' && typeof callback === 'undefined') {
        callback = conditions
        conditions = {}
      }

      const arr = eventName ? [`tm.event = '${eventName}'`] : []

      if (conditions.fromBlock) {
        arr.push(`tx.height>${+conditions.fromBlock - 1}`)
      }

      if (conditions.toBlock) {
        arr.push(`tx.height<${+conditions.fromBlock + 1}`)
      }

      if (conditions.atBlock) {
        arr.push(`tx.height=${conditions.fromBlock}`)
      }

      // tags, equal only
      const tags = conditions.tags || {}
      Object.keys(tags).forEach(key => {
        const value = tags[key]
        arr.push(`${key}=${value}`)
      })

      // raw tag conditions, can use >, <, =, CONTAINS
      const where = conditions.where || []
      where.forEach(w => {
        arr.push(w)
      })

      query = arr.join(' AND ')
    }

    // ensure to return promise => simpler for clients
    const unsubscribe = () => {
      const sub = this._wssub[query]
      if (!sub) {
        return Promise.resolve(undefined)
      }

      removeItem(sub.callbacks, callback)
      if (sub.callbacks.length > 0) {
        return Promise.resolve(undefined)
      }

      return this.rpc.call('unsubscribe', { query }).then(res => {
        delete this._wssub[query]
        return res
      })
    }

    if (this._wssub[query]) {
      this._wssub[query].callbacks.push(callback)
      return Promise.resolve({ unsubscribe })
    }

    return this.rpc.call('subscribe', { query: query }).then((result) => {
      this._wssub[query] = {
        id: result.id,
        query,
        callbacks: [callback]
      }

      this._wshandler = this._wshandler || {}
      if (!this._wshandler.onmessage) {
        this._wshandler.onmessage = msg => {
          Object.values(this._wssub).forEach(({ id, callbacks }) => {
            if (msg.id === id + '#event') {
              const error = msg.error
              const result = msg.result

              if (result && result.data && result.data.type === 'tendermint/event/Tx') {
                const r = result.data.value.TxResult
                r.tx_result = r.result // rename for utils.decode
                decode(r)
                delete r.tx_result
              }
              callbacks.forEach(cb => cb(error, result))
            }
          })
        }
        this.rpc.registerEventListener('onResponse', this._wshandler.onmessage)
      }

      return { unsubscribe }
    }).catch(callback)
  }

  registerEventListener (event, callback) {
    if (!this.isWebSocket) throw new Error('registerEventListener is for WebSocketProvider only.')
    this.rpc.registerEventListener(event, callback)
  }

  onError (callback) {
    if (!this.isWebSocket) throw new Error('onError is for WebSocketProvider only')
    this.rpc.registerEventListener('onError', callback)
  }

  onClose (callback) {
    if (!this.isWebSocket) throw new Error('onClose is for WebSocketProvider only')
    this.rpc.registerEventListener('onClose', callback)
  }

  contract (...args) {
    return new Contract(this, ...args)
  }

  deploy (mode, src, params = [], options = {}) {
    const tx = _serializeDataForDeploy(mode, src, params, options)
    return this.sendTransactionCommit(tx, options)
      .then(res => this.contract(res))
  }

  deployJs (src, params = [], options = {}) {
    return this.deploy(ContractMode.JS_RAW, src, params, options)
  }

  deployWasm (wasmBuffer, params = [], options = {}) {
    return this.deploy(ContractMode.WASM, wasmBuffer, params, options)
  }

  transfer (to, value, options = {}, params = options.params) {
    const tx = { from: options.from, to, value, fee: options.fee, payer: options.payer }
    if (params) {
      tx.data = { params } // params for __on_received
    }
    return this.sendTransactionCommit(tx, options)
  }
}

exports.IceteaWeb3.utils = exports.utils

function _serializeDataForDeploy (mode, src, params, options) {
  var formData = {}
  var txData = {
    op: TxOp.DEPLOY_CONTRACT,
    mode: mode,
    params: params
  }
  if (mode === ContractMode.JS_DECORATED || mode === ContractMode.JS_RAW) {
    txData.src = switchEncoding(src, 'utf8', 'base64')
  } else {
    if (Buffer.isBuffer(src)) {
      src = Buffer.toString('base64')
    } else if (typeof src !== 'string') {
      throw Error('Wasm binary must be in form of Buffer or base64-encoded string.')
    }
    txData.src = src
  }

  // because this is for deploying, we won't set fromData.to
  formData.from = options.from
  formData.payer = options.payer
  formData.value = options.value || 0
  formData.fee = options.fee || 0
  formData.data = txData
  return formData
}

function _sendSignedTx (rpc, tx, method) {
  if (!tx.evidence || !tx.evidence.length) {
    throw new Error('Transaction was not signed yet.')
  }

  // if (tx.hasOwnProperty('from') && tx.evidence.length === 1 && tx.from === ecc.toAddress(tx.evidence[0].pubkey)) {
  //   delete tx.from // save some bits
  // }

  return rpc.send(method, tx)
    .then(decode)
}

function _signTx (tx, wallet, signers) {
  signers = _extractSigners(tx, signers)
  if (!Array.isArray(signers)) {
    signers = [signers]
  }
  signers.forEach(s => {
    const privateKey = wallet.getPrivateKeyByAddress(s)
    if (!privateKey) {
      throw new Error('Not found private key to sign for signer: ' + s)
    }
    tx = signTransaction(tx, privateKey)
  })

  return tx
}

function _signAndSend (rpc, tx, waitOption, wallet, signers) {
  return _sendSignedTx(rpc, _signTx(tx, wallet, signers), waitOption)
}

function _extractSigners (tx, opts) {
  if (!opts) {
    return tx.from
  }

  if (typeof opts === 'string' || Array.isArray(opts)) {
    return opts
  }

  return opts.signers || opts.from || tx.from
}
