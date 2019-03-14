/*! icetea-common v0.1.4 */
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/icetea-common/Tx.js":
/*!*********************************!*\
  !*** ./src/icetea-common/Tx.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = __webpack_require__(/*! ./enum */ "./src/icetea-common/enum.js"),
    TxOp = _require.TxOp;

var _require2 = __webpack_require__(/*! ./codec */ "./src/icetea-common/codec.js"),
    sha256 = _require2.sha256;

module.exports =
/*#__PURE__*/
function () {
  // create contract
  // data = {
  //    op: 0,
  //    src: "console.log('hello world')";
  // }
  // call contract function
  // data = {
  //    op: 1,
  //    name: "functionName",
  //    params: [1, "hello"]
  // }
  //
  // Some op in the future: set alias/options, vote, etc.
  function _class(from, to, value, fee, data, nonce) {
    _classCallCheck(this, _class);

    if (!from) {
      throw new Error('Transaction "from" is required.');
    }

    this.from = from || '';
    this.to = to || '';
    this.value = parseFloat(value) || 0;
    this.fee = parseFloat(fee) || 0;
    this.data = data || {};
    this.nonce = nonce || Date.now(); // FIXME

    if (this.value < 0 || this.fee < 0) {
      throw new Error('Value and fee cannot be negative.');
    }

    var content = {
      from: this.from,
      to: this.to,
      value: this.value,
      fee: this.fee,
      data: this.data,
      nonce: this.nonce
    };
    this.signatureMessage = sha256(content, 'hex');
  }

  _createClass(_class, [{
    key: "setSignature",
    value: function setSignature(signature) {
      this.signature = signature;
      return this;
    }
  }, {
    key: "isContractCreation",
    value: function isContractCreation() {
      return this.data && this.data.op === TxOp.DEPLOY_CONTRACT;
    }
  }, {
    key: "isContractCall",
    value: function isContractCall() {
      return this.data && this.data.op === TxOp.CALL_CONTRACT;
    }
  }]);

  return _class;
}();

/***/ }),

/***/ "./src/icetea-common/codec.js":
/*!************************************!*\
  !*** ./src/icetea-common/codec.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Encapsulate codec logic here so we might change from msgpack to
// others (protobuf3, amino, bson, RLP) if desired
var msgpack = __webpack_require__(/*! msgpack-lite */ "msgpack-lite");

var json = __webpack_require__(/*! deterministic-json */ "deterministic-json");

var _require = __webpack_require__(/*! crypto */ "crypto"),
    createHash = _require.createHash;

exports.encode = msgpack.encode;
exports.decode = msgpack.decode;
exports.stringify = json.stringify;
exports.parse = json.parse;

exports.sha256 = function (content, enc) {
  if (typeof content !== 'string') {
    content = json.stringify(content);
  }

  var hash = createHash('sha256').update(content);

  if (enc) {
    return hash.digest(enc); // Text
  }

  return hash.digest(); // Buffer
};

/***/ }),

/***/ "./src/icetea-common/ecc.js":
/*!**********************************!*\
  !*** ./src/icetea-common/ecc.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ecc = __webpack_require__(/*! eosjs-ecc */ "eosjs-ecc");

var Tx = __webpack_require__(/*! ./Tx */ "./src/icetea-common/Tx.js");

var t = {
  verify: function verify(signature, message, pubKey) {
    if (!signature) throw new Error('Signature is required');
    if (!message) throw new Error('Message is required to verify signature');
    return ecc.verify(signature, message, 'EOS' + pubKey);
  },
  verifyTxSignature: function verifyTxSignature(tx) {
    if (!t.verify(tx.signature, tx.signatureMessage, tx.from)) {
      throw new Error('Invalid signature');
    }
  },
  generateKey: ecc.randomKey,
  toPublicKey: function toPublicKey(privateKey) {
    return ecc.privateToPublic(privateKey).slice(3);
  },
  sign: ecc.sign,
  signTxData: function signTxData(txData, privateKey) {
    var tx = new Tx(txData.from, txData.to, txData.value, txData.fee, txData.data, txData.nonce);
    txData.signature = ecc.sign(tx.signatureMessage, privateKey);

    if (!txData.nonce) {
      txData.nonce = tx.nonce;
    }

    if (typeof txData.data !== 'string') {
      txData.data = JSON.stringify(txData.data);
    }

    return txData;
  }
};
module.exports = t;

/***/ }),

/***/ "./src/icetea-common/enum.js":
/*!***********************************!*\
  !*** ./src/icetea-common/enum.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.ContractMode = Object.freeze({
  JS_RAW: 0,
  JS_DECORATED: 1,
  WASM: 100
});
exports.TxOp = Object.freeze({
  DEPLOY_CONTRACT: 0,
  CALL_CONTRACT: 1,
  VOTE: 2
});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var codec = __webpack_require__(/*! ./icetea-common/codec */ "./src/icetea-common/codec.js");

var ecc = __webpack_require__(/*! ./icetea-common/ecc */ "./src/icetea-common/ecc.js");

var Tx = __webpack_require__(/*! ./icetea-common/Tx */ "./src/icetea-common/Tx.js");

var _require = __webpack_require__(/*! ./icetea-common/enum */ "./src/icetea-common/enum.js"),
    ContractMode = _require.ContractMode,
    TxOp = _require.TxOp;

exports.codec = codec;
exports.ecc = ecc;
exports.Tx = Tx;
exports.ContractMode = ContractMode;
exports.TxOp = TxOp;

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "deterministic-json":
/*!*************************************!*\
  !*** external "deterministic-json" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("deterministic-json");

/***/ }),

/***/ "eosjs-ecc":
/*!****************************!*\
  !*** external "eosjs-ecc" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("eosjs-ecc");

/***/ }),

/***/ "msgpack-lite":
/*!*******************************!*\
  !*** external "msgpack-lite" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("msgpack-lite");

/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map