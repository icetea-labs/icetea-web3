const { newAccount, getAccount } = require('icetea-common').utils
const { codec } = require('icetea-common')

// function getFromStorage () {
//   var dataLocal = localStorage.getItem('accounts')
//   if (dataLocal) {
//     dataLocal = JSON.parse(dataLocal)
//     // Object.keys(dataLocal).forEach(k => {
//     //   dataLocal[k].privateKey = codec.toBuffer(dataLocal[k].privateKey, 'base64')
//     //   dataLocal[k].publicKey = codec.toBuffer(dataLocal[k].publicKey, 'base64')
//     // })
//   } else {
//     dataLocal = {defaultAccount:'', accounts:[] }
//   }
//   return dataLocal
// }

// function saveToStorage (account) {
//   var local = getFromStorage()
//   account.privateKey = codec.toString(account.privateKey, 'base58')
//   account.publicKey = codec.toString(account.publicKey, 'base58')
//   local.accounts.push(account)
//   if(local.defaultAccount == '') local.defaultAccount = local.accounts[0].address
//   localStorage.setItem('accounts', JSON.stringify(local))
// }
const _localStorage = localStorage
const _storage = {
  set defaultAccount (value) {
    var local = _storage.getData()
    if (!local) throw new Error('Please import account before set defaultAccount!')
    // check address in wallet
    var isExist = false
    for (var i = 0; i < local.accounts.length; i++) {
      if (local.accounts[i].address === value) {
        isExist = true
        break
      }
    }
    if (isExist) {
      local.defaultAccount = value
      _storage.saveData(local)
    } else {
      throw new Error("Address don't exist in wallet")
    }
  },
  get defaultAccount () {
    var local = _storage.getData()
    if (local.defaultAccount) {
      return local.defaultAccount
    } else if (local.accounts.length > 0) {
      _storage.defaultAccount = local.accounts[0].address
      return local.accounts[0].address
    } else {
      throw new Error('Please import account before get defaultAccount!')
    }
  },
  addAccount (account) {
    var local = _storage.getData()
    account.privateKey = codec.toString(account.privateKey, 'base58')
    account.publicKey = codec.toString(account.publicKey, 'base58')
    local.accounts.push(account)
    _storage.saveData(local)
  },
  getAccounts () {
    return _storage.getData().accounts
  },
  saveData (data) {
    _localStorage.setItem('accounts', JSON.stringify(data))
  },
  getData () {
    var dataLocal = _localStorage.getItem('accounts')
    if (!dataLocal) dataLocal = `{"defaultAccount":"","accounts":[]}`
    return JSON.parse(dataLocal)
  }
}

class Wallet {
  set defaultAccount (value) {
    _storage.defaultAccount = value
  }

  get defaultAccount () {
    return _storage.defaultAccount
  }

  createAccount () {
    var account = newAccount()
    _storage.addAccount(account)
    return account
  }

  importAccount (privateKey) {
    var account = getAccount(privateKey)
    if (!this.getAccountByAddress(account.address)) {
      _storage.addAccount(account)
    }
    return account
  }

  getAccountByPrivateKey (privateKey) {
    return getAccount(privateKey)
  }

  get accounts () {
    return _storage.getAccounts()
  }

  getAccountByAddress (address) {
    var accounts = _storage.getAccounts()
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].address === address) {
        return accounts[i]
      }
    }
  }
}

module.exports = Wallet
