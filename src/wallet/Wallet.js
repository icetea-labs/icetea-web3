const { newAccount, getAccount } = require('@iceteachain/common').utils
const { codec } = require('@iceteachain/common')
const keythereum = require('keythereum')

var _wallet = { defaultAccount: '', accounts: [] }
const _ram = {
  set wallet (value) {
    _wallet = value
  },
  get wallet () {
    return _wallet
  },
  set defaultAccount (value) {
    if (!_ram.wallet.accounts.length === 0) throw new Error('Please import account before set defaultAccount.')
    // check address in wallet
    var isExist = false
    for (var i = 0; i < _ram.wallet.accounts.length; i++) {
      if (_ram.wallet.accounts[i].address === value) {
        isExist = true
        break
      }
    }
    if (isExist) {
      _ram.wallet.defaultAccount = value
    } else {
      throw new Error('Address ' + value + " doesn't exist in wallet.")
    }
  },
  get defaultAccount () {
    if (_ram.wallet.defaultAccount) {
      return _ram.wallet.defaultAccount
    } else if (_ram.wallet.accounts.length > 0) {
      // set defaultAccount is address of first account
      _ram.wallet.defaultAccount = _ram.wallet.accounts[0].address
      return _ram.wallet.defaultAccount
    }
  },
  addAccount (account) {
    // check private exsit before add account
    var isExist = false
    for (var i = 0; i < _ram.wallet.accounts.length; i++) {
      if (_ram.wallet.accounts[i].privateKey === account.privateKey) {
        isExist = true
        break
      }
    }
    if (!isExist) _ram.wallet.accounts.push(account)
  },
  getAccounts () {
    return _ram.wallet.accounts
  }
}

function getStorage () {
  if (typeof localStorage !== 'undefined') {
    return localStorage // eslint-disable-line
  }

  return {
    _data: {},
    setItem: function (id, val) { return this._data[id] = val }, // eslint-disable-line
    getItem: function (id) { return this._data[id] },
    removeItem: function (id) { return delete this._data[id] },
    clear: function () { return this._data = {} } // eslint-disable-line
  }
}

let _localStorage = getStorage()
const _storage = {
  saveData (data) {
    return Promise.resolve(_localStorage.setItem('_icetea_accounts', JSON.stringify(data)))
  },
  getData () {
    Promise.resolve(_localStorage.getItem('_icetea_accounts'))
      .then(function (dataLocal) {
        if (!dataLocal) {
          return {
            defaultAccount: '',
            accounts: []
          }
        }
        return JSON.parse(dataLocal)
      })
  },

  encode (password) {
    var options = {}

    var dk = keythereum.create()
    var walletStogare = { defaultAccount: '', accounts: [] }
    _ram.wallet.accounts.forEach(item => {
      if (item.privateKey) {
        var privateKey = codec.toBuffer(item.privateKey)
        var keyObject = keythereum.dump(password, privateKey, dk.salt, dk.iv, options)
        walletStogare.accounts.push(keyObject)
      }
    })
    walletStogare.defaultAccount = _ram.wallet.defaultAccount
    return walletStogare
  },
  decode (password, walletStogare, addresses) {
    if (addresses && !Array.isArray(addresses)) {
      addresses = [addresses]
    }
    var wallettmp = { defaultAccount: '', accounts: [] }
    wallettmp.defaultAccount = walletStogare.defaultAccount
    walletStogare.accounts.forEach(keyObject => {
      if (!addresses || addresses.includes(keyObject.address)) {
        var privateKey = keyObject.privateKey || keythereum.recover(password, keyObject)
        var account = keyObject.signTransaction ? keyObject : getAccount(privateKey)
        wallettmp.accounts.push(account)
      } else {
        wallettmp.accounts.push(keyObject)
      }
    })
    return wallettmp
  }
}

class Wallet {
  set defaultAccount (value) {
    _ram.defaultAccount = value
  }

  get defaultAccount () {
    return _ram.defaultAccount
  }

  get accounts () {
    return _ram.getAccounts()
  }

  createAccount () {
    var account = newAccount()
    _ram.addAccount(account)
    return account
  }

  importAccount (privateKey) {
    var account
    if (typeof privateKey === 'string') {
      account = getAccount(privateKey)
    } else {
      account = privateKey
    }
    _ram.addAccount(account)
    return account
  }

  getAccountByPrivateKey (privateKey) {
    return getAccount(privateKey)
  }

  getPrivateKeyByAddress (fromAddress) {
    if (!fromAddress) {
      fromAddress = this.defaultAccount
    }
    var account = this.getAccountByAddress(fromAddress)
    if (account) return account.privateKey
  }

  getAccountByAddress (address) {
    var accounts = this.accounts
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].address === address || accounts[i].publicKey === address) {
        return accounts[i]
      }
    }
  }

  saveToStorage (password) {
    if (!password) {
      throw Error('Password is required.')
    }
    var walletStogare = _storage.encode(password)
    _storage.saveData(walletStogare)
    return walletStogare.accounts.length
  }

  loadFromStorage (password, walletStogare, addresses) {
    walletStogare = Promise.resolve(walletStogare || _storage.getData())
      .then(function (walletStogare) {
        if (walletStogare && walletStogare.accounts.length > 0) {
          if (!password) {
            throw Error('Password is required.')
          }
          var wallettmp = _storage.decode(password, walletStogare, addresses)
          // load data from localstorage and set on wallet in ram
          _ram.wallet = wallettmp
        }
        return _ram.wallet.accounts.length
      })
  }

  setStorate (storage) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      throw new Error('Storage must be an object with getItem and setItem functions.')
    }
    _localStorage = storage
  }
}

module.exports = Wallet
