// A light JS to read 'view' and 'pure' contract method
// It is ES6 module, intended for use in browser only with bundler
// NodeJS could use the 'heavy' index.js, as the size does not matter

import { encode, decode } from '@iceteachain/common/src/codec'

function _sanitizeParams (params) {
  params = params || {}
  Object.keys(params).forEach(k => {
    const v = params[k]
    if (typeof v === 'number') {
      params[k] = String(v)
    }
  })
  return params
}

function _tryJsonStringify (p) {
  if (typeof p === 'string') {
    return p
  }

  try {
    return JSON.stringify(p)
  } catch (e) {
    // console.log("WARN: ", e);
    return String(p)
  }
}

function _httpCall (httpEndpoint, method, params, options) {
  const json = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params: _sanitizeParams(params)
  }

  const fetchOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(json)
  }

  if (options) {
    Object.assign(fetchOptions, options)
  }

  return window.fetch(httpEndpoint, fetchOptions)
    .then(resp => resp.json())
}

function _call (httpEndpoint, method, params) {
  return _httpCall(httpEndpoint, method, params).then(resp => {
    if (resp.error) {
      const err = new Error(resp.error.data || resp.error.message)
      err.error = resp.error
      throw err
    }
    if (resp.id) resp.result.id = resp.id
    return resp.result
  })
}

// query application state (read)
function _query (httpEndpoint, path, data) {
  const params = { path }
  if (data) {
    params.data = encode(data).toString('hex')
  }

  return _call('abci_query', params).then(result => {
    const r = result.response

    if (r.code) {
      const err = new Error(_tryJsonStringify((r.info && r.info.message) || r.info || r.log || data))
      err.code = r.code
      err.info = r.info
      err.log = r.log
      throw err
    }

    return decode(Buffer.from(r.value, 'base64'))
  })
}

function _callMethod (httpEndpoint, callType, contract, method, params) {
  return _query(httpEndpoint, callType, { address: contract, name: method, params })
}

export function callView (httpEndpoint, contract, method, ...params) {
  return _callMethod(httpEndpoint, 'invokeView', contract, method, params)
}

export function callPure (httpEndpoint, contract, method, ...params) {
  return _callMethod(httpEndpoint, 'invokePure', contract, method, params)
}
