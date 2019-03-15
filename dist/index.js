/*! iceweb3 v0.1.6 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["IceTeaWeb3"] = factory();
	else
		root["IceTeaWeb3"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/contract/Contract.js":
/*!**********************************!*\
  !*** ./src/contract/Contract.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = __webpack_require__(/*! icetea-common */ "icetea-common"),
    ecc = _require.ecc,
    TxOp = _require.TxOp;

function _serializeData(address, method, privateKey) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var formData = {};
  var txData = {
    op: TxOp.CALL_CONTRACT,
    name: method,
    params: params
  };
  formData.from = ecc.toPublicKey(privateKey);
  formData.to = address;
  formData.value = options.value || 0;
  formData.fee = options.fee || 0;
  formData.data = txData;
  return formData;
}

var Contract = function Contract(tweb3, address, privateKey) {
  _classCallCheck(this, Contract);

  // this.iweb3 = iweb3;
  // this.address = address;
  this.methods = new Proxy({}, {
    get: function get(obj, method) {
      return {
        call: function call() {
          var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return tweb3.callReadonlyContractMethod(address, method, params, options);
        },
        sendAsync: function sendAsync(params, options) {
          var tx = _serializeData(address, method, privateKey, params, options);

          return tweb3.sendTransactionAsync(tx, privateKey);
        },
        sendSync: function sendSync(params, options) {
          var tx = _serializeData(address, method, privateKey, params, options);

          return tweb3.sendTransactionSync(tx, privateKey);
        },
        sendCommit: function sendCommit(params, options) {
          var tx = _serializeData(address, method, privateKey, params, options);

          return tweb3.sendTransactionCommit(tx, privateKey);
        }
      };
    },
    set: function set() {
      throw new Error('Cannot change methods.');
    }
  });
};

module.exports = Contract;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var signTxData = __webpack_require__(/*! icetea-common */ "icetea-common").ecc.signTxData;

var _require = __webpack_require__(/*! icetea-common */ "icetea-common"),
    ecc = _require.ecc,
    TxOp = _require.TxOp,
    ContractMode = _require.ContractMode;

var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var _require2 = __webpack_require__(/*! ./utils */ "./src/utils.js"),
    switchEncoding = _require2.switchEncoding,
    decodeTX = _require2.decodeTX,
    decodeEventData = _require2.decodeEventData,
    decodeTags = _require2.decodeTags,
    decodeTxResult = _require2.decodeTxResult;

var Contract = __webpack_require__(/*! ./contract/Contract */ "./src/contract/Contract.js");

var HttpProvider = __webpack_require__(/*! ./providers/HttpProvider */ "./src/providers/HttpProvider.js");

var WebSocketProvider = __webpack_require__(/*! ./providers/WebSocketProvider */ "./src/providers/WebSocketProvider.js");

exports.utils = utils;
/**
 * The IceTea web client.
 */

exports.IceTeaWeb3 =
/*#__PURE__*/
function () {
  /**
   * Initialize the IceTeaWeb3 instance.
   * @param {string} endpoint tendermint endpoint, e.g. http://localhost:26657
   */
  function IceTeaWeb3(endpoint, options) {
    _classCallCheck(this, IceTeaWeb3);

    this.isWebSocket = !!(endpoint.startsWith('ws://') || endpoint.startsWith('wss://'));

    if (this.isWebSocket) {
      this.rpc = new WebSocketProvider(endpoint, options);
    } else {
      this.rpc = new HttpProvider(endpoint);
    }

    this.utils = {
      decodeEventData: decodeEventData,
      decodeTags: decodeTags,
      decodeTxResult: decodeTxResult
    };
    this.subscriptions = {};
    this.countSubscribeEvent = 0;
  }

  _createClass(IceTeaWeb3, [{
    key: "close",
    value: function close() {
      if (this.isWebSocket) {
        this.rpc.close();
      }
    }
    /**
     * Get account balance.
     * @param {string} address address of the account.
     * @returns {number} account balance.
     */

  }, {
    key: "getBalance",
    value: function getBalance(address) {
      return this.rpc.query('balance', address);
    }
    /**
     * Get a single block.
     * @param {*} options example {height: 10}, skip to get latest block.
     * @returns the tendermint block.
     */

  }, {
    key: "getBlock",
    value: function getBlock(options) {
      return this.rpc.call('block', options);
    }
    /**
     * Get a list of blocks.
     * @param {*} options optional, e.g. {minHeight: 0, maxHeight: 10}
     * @returns {Array} an array of tendermint blocks
     */

  }, {
    key: "getBlocks",
    value: function getBlocks(options) {
      return this.rpc.call('blockchain', options);
    }
    /**
     * Get a single transaction.
     * @param {string} hash required, hex string without '0x'.
     * @param {*} options optional, e.g. {prove: true} to request proof.
     * @return {*} the tendermint transaction.
     */

  }, {
    key: "getTransaction",
    value: function getTransaction(hash, options) {
      if (!hash) {
        throw new Error('hash is required');
      }

      return this.rpc.call('tx', _objectSpread({
        hash: switchEncoding(hash, 'hex', 'base64')
      }, options)).then(decodeTxResult);
    }
    /**
     * Search for transactions met the query specified.
     * @param {string} query required, query based on tendermint indexed tags, e.g. "tx.height>0".
     * @param {*} options additional options, e.g. {prove: true, page: 2, per_page: 20}
     * @returns {Array} Array of tendermint transactions.
     */

  }, {
    key: "searchTransactions",
    value: function searchTransactions(query, options) {
      if (!query) {
        throw new Error('query is required, example "tx.height>0"');
      }

      return this.rpc.call('tx_search', _objectSpread({
        query: query
      }, options));
    }
    /**
     * Search for events emit by contracts.
     * @param {string} eventName the event name, e.g. "Transferred"
     * @param {string} emitter optional, the contract address, or "system"
     * @param {*} conditions required, string or object literal.
     * string example: "tx.height>0 AND someIndexedField CONTAINS 'kkk'".
     * Object example: {fromBlock: 0, toBlock: 100, someIndexedField: "xxx"}.
     * Note that conditions are combined using AND, no support for OR.
     * @param {*} options additional options, e.g. {prove: true, page: 2, per_page: 20}
     * @returns {Array} Array of tendermint transactions containing the event.
     */

  }, {
    key: "getPastEvents",
    value: function getPastEvents(eventName, emitter) {
      var conditions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = arguments.length > 3 ? arguments[3] : undefined;
      var query = '';

      if (typeof conditions === 'string') {
        query = conditions;
      } else {
        if (!emitter) {
          emitter = '.';
        } else {
          emitter = '|' + emitter + '.';
        }

        query = Object.keys(conditions).reduce(function (arr, key) {
          var value = conditions[key];

          if (key === 'fromBlock') {
            arr.push("tx.height>".concat(value - 1));
          } else if (key === 'toBlock') {
            arr.push("tx.height<".concat(value + 1));
          } else {
            arr.push("".concat(key, "=").concat(value));
          }

          return arr;
        }, ["EventNames CONTAINS '".concat(emitter).concat(eventName, "|'")]).join(' AND ');
      }

      return this.searchTransactions(query, options);
    }
    /**
     * @return {string[]} Get all deployed smart contracts.
     */

  }, {
    key: "getContracts",
    value: function getContracts() {
      return this.rpc.query('contracts');
    }
    /**
     * Get contract metadata.
     * @param {string} contractAddr the contract address.
     * @returns {string[]} methods and fields array.
     */

  }, {
    key: "getMetadata",
    value: function getMetadata(contractAddr) {
      return this.rpc.query('metadata', contractAddr);
    }
    /**
     * Get account info.
     * @param {string} contractAddr  the contract address.
     * @returns {{balance: number, code: string | Buffer, mode: number, deployedBy: string, system: boolean}} Contract metadata.
     */

  }, {
    key: "getAccountInfo",
    value: function getAccountInfo(contractAddr) {
      return this.rpc.query('account_info', contractAddr);
    }
    /**
     * @private
     */

  }, {
    key: "getDebugState",
    value: function getDebugState() {
      return this.rpc.query('state');
    }
    /**
     * Send a transaction and return immediately.
     * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
     * @param {string} privateKey private key used to sign
     */

  }, {
    key: "sendTransactionAsync",
    value: function sendTransactionAsync(tx, privateKey) {
      return this.rpc.send('broadcast_tx_async', signTxData(tx, privateKey));
    }
    /**
     * Send a transaction and wait until it reach mempool.
     * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
     * @param {string} privateKey private key used to sign
     */

  }, {
    key: "sendTransactionSync",
    value: function sendTransactionSync(tx, privateKey) {
      return this.rpc.send('broadcast_tx_sync', signTxData(tx, privateKey));
    }
    /**
     * Send a transaction and wait until it is included in a block.
     * @param {{from: string, to: string, value: number, fee: number, data: Object}} tx the transaction object.
     * @param {string} privateKey private key used to sign
     */

  }, {
    key: "sendTransactionCommit",
    value: function sendTransactionCommit(tx, privateKey) {
      return this.rpc.send('broadcast_tx_commit', signTxData(tx, privateKey)).then(decodeTxResult);
    }
    /**
     * Call a readonly (@view) contract method or field.
     * @param {string} contract required, the contract address.
     * @param {string} method required, method or field name.
     * @param {Array} params method params, if any.
     * @param {*} options optional options, e.g. {from: 'xxx'}
     */

  }, {
    key: "callReadonlyContractMethod",
    value: function callReadonlyContractMethod(contract, method) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return this.rpc.query('invokeView', {
        address: contract,
        name: method,
        params: params,
        options: options
      });
    }
    /**
     * Call a pure (@pure) contract method or field.
     * @param {string} contract required, the contract address.
     * @param {string} method required, method or field name.
     * @param {Array} params method params, if any.
     * @param {*} options optional options, e.g. {from: 'xxx'}
     */

  }, {
    key: "callPureContractMethod",
    value: function callPureContractMethod(contract, method) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return this.rpc.query('invokePure', {
        address: contract,
        name: method,
        params: params,
        options: options
      });
    } // shorthand for transfer, deploy, write, read contract goes here

    /**
       * Subscribes by event (for WebSocket only)
       *
       * @method subscribe
       *
       * @param {MessageEvent} EventName
       */

  }, {
    key: "subscribe",
    value: function subscribe(eventName) {
      var _this = this;

      var conditions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var callback = arguments.length > 2 ? arguments[2] : undefined;
      if (!this.isWebSocket) throw new Error('subscribe for WebSocket only');
      var systemEvent = ['NewBlock', 'NewBlockHeader', 'Tx', 'RoundState', 'NewRound', 'CompleteProposal', 'Vote', 'ValidatorSetUpdates', 'ProposalString'];
      var isSystemEvent = true;
      var nonSystemEventName;
      var space = '';

      if (systemEvent.indexOf(eventName) < 0) {
        isSystemEvent = false;
        nonSystemEventName = eventName;
        this.countSubscribeEvent += 1;
        eventName = 'Tx';
      }

      for (var i = 0; i < this.countSubscribeEvent; i++) {
        space = space + ' ';
      }

      var query = '';

      if (typeof conditions === 'string') {
        query = conditions;
      } else {
        if (typeof conditions === 'function' && typeof callback === 'undefined') {
          callback = conditions;
          conditions = {};
        }

        query = Object.keys(conditions).reduce(function (arr, key) {
          var value = conditions[key];

          if (key === 'fromBlock') {
            arr.push("tx.height>".concat(value - 1));
          } else if (key === 'toBlock') {
            arr.push("tx.height<".concat(value + 1));
          } else {
            arr.push("".concat(key, "=").concat(value));
          }

          return arr;
        }, ["tm.event = ".concat(space, "'").concat(eventName, "'")]).join(' AND ');
      }

      return this.rpc.call('subscribe', {
        'query': query
      }).then(function (result) {
        _this.subscriptions[result.id] = {
          id: result.id,
          subscribeMethod: nonSystemEventName || eventName,
          query: query // console.log('this.subscriptions',this.subscriptions);

        };

        _this.rpc.registerEventListener('onMessage', function (message) {
          var jsonMsg = JSON.parse(message);

          if (result.id && jsonMsg.id.indexOf(result.id) >= 0) {
            if (isSystemEvent) {
              return callback(message);
            } else {
              var events = decodeEventData(jsonMsg.result);
              events.forEach(function (event) {
                if (event.eventName && nonSystemEventName === event.eventName) {
                  var res = {};
                  res.jsonrpc = jsonMsg.jsonrpc;
                  res.id = jsonMsg.id;
                  res.result = event;
                  res.result.query = _this.subscriptions[result.id].query;
                  return callback(JSON.stringify(res), null, 2);
                }
              });
            }
          }
        });

        return result;
      });
    }
    /**
     * Unsubscribes by event (for WebSocket only)
     *
     * @method unsubscribe
     *
     * @param {SubscriptionId} subscriptionId
     */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(subscriptionId) {
      var _this2 = this;

      if (!this.isWebSocket) throw new Error('unsubscribe for WebSocket only');

      if (typeof this.subscriptions[subscriptionId] !== 'undefined') {
        return this.rpc.call('unsubscribe', {
          'query': this.subscriptions[subscriptionId].query
        }).then(function (res) {
          delete _this2.subscriptions[subscriptionId];
          return res;
        });
      }

      return Promise.reject(new Error("Error: Subscription with ID ".concat(subscriptionId, " does not exist.")));
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      if (!this.isWebSocket) throw new Error('onMessage for WebSocket only');
      this.rpc.registerEventListener('onMessage', callback);
    }
  }, {
    key: "onResponse",
    value: function onResponse(callback) {
      if (!this.isWebSocket) throw new Error('onResponse for WebSocket only');
      this.rpc.registerEventListener('onResponse', callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      if (!this.isWebSocket) throw new Error('onError for WebSocket only');
      this.rpc.registerEventListener('onError', callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      if (!this.isWebSocket) throw new Error('onClose for WebSocket only');
      this.rpc.registerEventListener('onClose', callback);
    }
  }, {
    key: "contract",
    value: function contract(address, privateKey) {
      return new Contract(this, address, privateKey);
    }
  }, {
    key: "deploy",
    value: function () {
      var _deploy = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(mode, src, privateKey) {
        var params,
            options,
            tx,
            res,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = _args.length > 3 && _args[3] !== undefined ? _args[3] : [];
                options = _args.length > 4 && _args[4] !== undefined ? _args[4] : {};
                tx = this._serializeData(mode, src, privateKey, params, options);
                _context.next = 5;
                return this.sendTransactionCommit(tx, privateKey);

              case 5:
                res = _context.sent;
                return _context.abrupt("return", this.getTransaction(res.hash).then(function (result) {
                  if (result.tx_result.code) {
                    var err = new Error(result.tx_result.log);
                    Object.assign(err, result);
                    throw err;
                  }

                  var data = decodeTX(result.tx); // console.log("data1",data);

                  return {
                    hash: result.hash,
                    height: result.height,
                    address: result.tx_result.data,
                    data: {
                      from: data.from,
                      to: result.tx_result.data,
                      value: data.value,
                      fee: data.fee
                    }
                  };
                }));

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function deploy(_x, _x2, _x3) {
        return _deploy.apply(this, arguments);
      }

      return deploy;
    }()
  }, {
    key: "_serializeData",
    value: function _serializeData(mode, src, privateKey, params, options) {
      var formData = {};
      var txData = {
        op: TxOp.DEPLOY_CONTRACT,
        mode: mode,
        params: params
      };

      if (mode === ContractMode.JS_DECORATED || mode === ContractMode.JS_RAW) {
        txData.src = switchEncoding(src, 'utf8', 'base64');
      } else {
        txData.src = src;
      }

      formData.from = ecc.toPublicKey(privateKey);
      formData.value = options.value || 0;
      formData.fee = options.fee || 0;
      formData.data = txData;
      return formData;
    }
  }]);

  return IceTeaWeb3;
}();

/***/ }),

/***/ "./src/providers/BaseProvider.js":
/*!***************************************!*\
  !*** ./src/providers/BaseProvider.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = __webpack_require__(/*! ../utils */ "./src/utils.js"),
    switchEncoding = _require.switchEncoding,
    encodeTX = _require.encodeTX,
    tryParseJson = _require.tryParseJson;

var BaseProvider =
/*#__PURE__*/
function () {
  function BaseProvider() {
    _classCallCheck(this, BaseProvider);
  }

  _createClass(BaseProvider, [{
    key: "sanitizeParams",
    value: function sanitizeParams(params) {
      params = params || {};
      Object.keys(params).forEach(function (k) {
        var v = params[k];

        if (typeof v === 'number') {
          params[k] = String(v);
        }
      });
      return params;
    }
  }, {
    key: "_call",
    value: function _call(method, params) {} // call a jsonrpc, normally to query blockchain (block, tx, validator, consensus, etc.) data

  }, {
    key: "call",
    value: function call(method, params) {
      return this._call(method, params).then(function (resp) {
        if (resp.error) {
          var err = new Error(resp.error.message);
          Object.assign(err, resp.error);
          throw err;
        }

        if (resp.id) resp.result.id = resp.id;
        return resp.result;
      });
    } // query application state (read)

  }, {
    key: "query",
    value: function query(path, data, options) {
      var params = _objectSpread({
        path: path
      }, options);

      if (data) {
        if (typeof data !== 'string') {
          data = JSON.stringify(data);
        }

        params.data = switchEncoding(data, 'utf8', 'hex');
      }

      return this._call('abci_query', params).then(function (resp) {
        if (resp.error) {
          var err = new Error(resp.error.message);
          Object.assign(err, resp.error);
          throw err;
        } // decode query data embeded in info


        var r = resp.result;

        if (r && r.response && r.response.info) {
          r = tryParseJson(r.response.info);
        }

        return r;
      });
    } // send a transaction (write)

  }, {
    key: "send",
    value: function send(method, tx) {
      return this.call(method, {
        // for jsonrpc, encode in 'base64'
        // for query string (REST), encode in 'hex' (or 'utf8' inside quotes)
        tx: encodeTX(tx, 'base64')
      }).then(function (result) {
        if (result.code) {
          var err = new Error(result.log);
          Object.assign(err, result);
          throw err;
        }

        return result;
      });
    }
  }]);

  return BaseProvider;
}();

module.exports = BaseProvider;

/***/ }),

/***/ "./src/providers/HttpProvider.js":
/*!***************************************!*\
  !*** ./src/providers/HttpProvider.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var fetch = __webpack_require__(/*! node-fetch */ "node-fetch");

var BaseProvider = __webpack_require__(/*! ./BaseProvider */ "./src/providers/BaseProvider.js");

var HttpProvider =
/*#__PURE__*/
function (_BaseProvider) {
  _inherits(HttpProvider, _BaseProvider);

  function HttpProvider(endpoint) {
    var _this;

    _classCallCheck(this, HttpProvider);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HttpProvider).call(this));
    _this.endpoint = endpoint;
    return _this;
  }

  _createClass(HttpProvider, [{
    key: "_call",
    value: function _call(method, params) {
      var json = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: this.sanitizeParams(params)
      };
      return fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(json)
      }).then(function (resp) {
        return resp.json();
      });
    }
  }, {
    key: "sanitizeParams",
    value: function sanitizeParams(params) {
      return _get(_getPrototypeOf(HttpProvider.prototype), "sanitizeParams", this).call(this, params);
    }
  }]);

  return HttpProvider;
}(BaseProvider);

module.exports = HttpProvider;

/***/ }),

/***/ "./src/providers/WebSocketProvider.js":
/*!********************************************!*\
  !*** ./src/providers/WebSocketProvider.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var BaseProvider = __webpack_require__(/*! ./BaseProvider */ "./src/providers/BaseProvider.js");

var W3CWebSocket = __webpack_require__(/*! websocket */ "websocket").w3cwebsocket;

var WebSocketAsPromised = __webpack_require__(/*! websocket-as-promised */ "websocket-as-promised");

var WebSocketProvider =
/*#__PURE__*/
function (_BaseProvider) {
  _inherits(WebSocketProvider, _BaseProvider);

  function WebSocketProvider(endpoint, options) {
    var _this;

    _classCallCheck(this, WebSocketProvider);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WebSocketProvider).call(this));
    _this.endpoint = endpoint;
    _this.options = options || {
      createWebSocket: function createWebSocket(url) {
        return new W3CWebSocket(url);
      },
      packMessage: function packMessage(data) {
        return JSON.stringify(data);
      },
      unpackMessage: function unpackMessage(message) {
        return JSON.parse(message);
      },
      attachRequestId: function attachRequestId(data, requestId) {
        return Object.assign({
          id: requestId
        }, data);
      },
      extractRequestId: function extractRequestId(data) {
        return data.id;
      } // timeout: 10000,

    };
    _this.wsp = new WebSocketAsPromised(_this.endpoint, _this.options);
    return _this;
  }

  _createClass(WebSocketProvider, [{
    key: "close",
    value: function close() {
      this.wsp.close();
    }
  }, {
    key: "registerEventListener",
    value: function registerEventListener(event, callback) {
      this.wsp[event].addListener(callback);
    }
  }, {
    key: "_call",
    value: function () {
      var _call2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(method, params) {
        var json;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                json = {
                  jsonrpc: '2.0',
                  method: method,
                  params: this.sanitizeParams(params)
                };

                if (this.wsp.isOpened) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return this.wsp.open();

              case 4:
                return _context.abrupt("return", this.wsp.sendRequest(json));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _call(_x, _x2) {
        return _call2.apply(this, arguments);
      }

      return _call;
    }()
  }, {
    key: "sanitizeParams",
    value: function sanitizeParams(params) {
      return _get(_getPrototypeOf(WebSocketProvider.prototype), "sanitizeParams", this).call(this, params);
    }
  }]);

  return WebSocketProvider;
}(BaseProvider);

module.exports = WebSocketProvider;

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _this = this;

var Buffer = __webpack_require__(/*! safe-buffer */ "safe-buffer").Buffer;

var _require = __webpack_require__(/*! icetea-common */ "icetea-common"),
    codec = _require.codec;

exports.replaceAll = function (text, search, replacement) {
  return text.split(search).join(replacement);
};

exports.tryParseJson = function (p) {
  try {
    return JSON.parse(p);
  } catch (e) {
    // console.log("WARN: ", e);
    return p;
  }
};

exports.tryStringifyJson = function (p) {
  try {
    return JSON.stringify(p);
  } catch (e) {
    // console.log("WARN: ", e);
    return p;
  }
};

exports.encodeTX = function (data) {
  var enc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'base64';
  return codec.encode(data).toString(enc);
};

exports.toBuffer = function (text, enc) {
  return Buffer.from(text, enc);
};

exports.switchEncoding = function (str, from, to) {
  return Buffer.from(str, from).toString(to);
};

exports.decodeTX = function (data) {
  var enc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'base64';
  return codec.decode(exports.toBuffer(data, enc));
};

exports.decodeTags = function (tx) {
  var keepEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var EMPTY_RESULT = {};
  var b64Tags = tx;

  if (tx.data && tx.data.value && tx.data.value.TxResult.result.tags) {
    b64Tags = tx.data.value.TxResult.result.tags; // For subscribe
  } else if (tx.tx_result && tx.tx_result.tags) {
    b64Tags = tx.tx_result.tags;
  } else if (tx.deliver_tx && tx.deliver_tx.tags) {
    b64Tags = tx.deliver_tx.tags;
  }

  if (!b64Tags.length) {
    return EMPTY_RESULT;
  }

  var tags = {}; // decode tags

  b64Tags.forEach(function (t) {
    var key = _this.switchEncoding(t.key, 'base64', 'utf8');

    var value = _this.switchEncoding(t.value, 'base64', 'utf8');

    tags[key] = _this.tryParseJson(value);
  });

  if (!keepEvents && tags.EventNames) {
    // remove event-related tags
    var events = tags.EventNames.split('|');
    events.forEach(function (e) {
      if (e) {
        var eventName = e.split('.')[1];
        Object.keys(tags).forEach(function (key) {
          if (key.indexOf(eventName) === 0) {
            delete tags[key];
          }
        });
        delete tags[e];
      }
    });
    delete tags.EventNames;
  }

  return tags;
};

exports.decodeTxResult = function (result) {
  if (!result) return result;
  var name = result.tx_result ? 'tx_result' : 'deliver_tx';

  if (result[name] && result[name].data) {
    result[name].data = _this.tryParseJson(_this.switchEncoding(result[name].data, 'base64', 'utf8'));
  }

  return result;
};

exports.decodeEventData = function (tx) {
  var EMPTY_RESULT = [];

  var tags = _this.decodeTags(tx, true);

  if (!tags.EventNames) {
    return EMPTY_RESULT;
  }

  var events = tags.EventNames.split('|');

  if (!events.length) {
    return EMPTY_RESULT;
  }

  var result = events.reduce(function (r, e) {
    if (e) {
      var parts = e.split('.');
      var emitter = parts[0];
      var eventName = parts[1];
      var eventData = Object.keys(tags).reduce(function (data, key) {
        var prefix = eventName + '.';

        if (key.startsWith(prefix)) {
          var name = key.substr(prefix.length);
          var value = tags[key];
          data[name] = value;
        } else if (key === eventName) {
          Object.assign(data, tags[key]);
        }

        return data;
      }, {});
      r.push({
        emitter: emitter,
        eventName: eventName,
        eventData: eventData
      });
    }

    return r;
  }, []);
  return result;
};

/***/ }),

/***/ 0:
/*!***********************************!*\
  !*** multi @babel/polyfill ./src ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! @babel/polyfill */"@babel/polyfill");
module.exports = __webpack_require__(/*! ./src */"./src/index.js");


/***/ }),

/***/ "@babel/polyfill":
/*!**********************************!*\
  !*** external "@babel/polyfill" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/polyfill");

/***/ }),

/***/ "icetea-common":
/*!********************************!*\
  !*** external "icetea-common" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("icetea-common");

/***/ }),

/***/ "node-fetch":
/*!*****************************!*\
  !*** external "node-fetch" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),

/***/ "safe-buffer":
/*!******************************!*\
  !*** external "safe-buffer" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("safe-buffer");

/***/ }),

/***/ "websocket":
/*!****************************!*\
  !*** external "websocket" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("websocket");

/***/ }),

/***/ "websocket-as-promised":
/*!****************************************!*\
  !*** external "websocket-as-promised" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("websocket-as-promised");

/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map