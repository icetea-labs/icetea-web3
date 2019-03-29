const { newAccount, getAccount } = require('icetea-common').utils
const { codec } = require('icetea-common')
const keythereum = require("keythereum")
const randomBytes = require('randombytes')

var wallet = { defaultAccount: '', accounts: [] }
const _ram = {
  set defaultAccount (value) {
    if (!wallet.accounts.length === 0) throw new Error('Please import account before set defaultAccount!')
    // check address in wallet
    var isExist = false
    for (var i = 0; i < wallet.accounts.length; i++) {
      if (wallet.accounts[i].address === value) {
        isExist = true
        break
      }
    }
    if (isExist) {
      wallet.defaultAccount = value
    } else {
      throw new Error("Address "+ value +" don't exist in wallet")
    }
  },
  get defaultAccount () {
    if (wallet.defaultAccount && wallet.defaultAccount != '') {
      return wallet.defaultAccount
    } else if (wallet.accounts.length > 0) {
      // set defaultAccount is address of first account
      wallet.defaultAccount = wallet.accounts[0].address
      return wallet.defaultAccount
    }
  },
  addAccount (account) {
    // check private exsit before add account
    var isExist = false
    for (var i = 0; i < wallet.accounts.length; i++) {
      if (wallet.accounts[i].privateKey === account.privateKey) {
        isExist = true
        break
      }
    }
    if (!isExist) wallet.accounts.push(account)
  },
  getAccounts () {
    return wallet.accounts
  }
}

function getStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }

  const LocalStorage = require('node-localstorage').LocalStorage
  return new LocalStorage('./localStorage')
}

const _localStorage = getStorage()
const _storage = {
  saveData (data) {
    _localStorage.setItem('accounts', JSON.stringify(data))
  },
  getData () {
    var dataLocal = _localStorage.getItem('accounts')
    if (!dataLocal) dataLocal = `{"defaultAccount":"","accounts":[]}`
    return JSON.parse(dataLocal)
  },
  encode (password) {
    var options = {
      kdf: "pbkdf2",
      cipher: "aes-128-ctr",
      kdfparams: {
        c: 262144,
        dklen: 32,
        prf: "hmac-sha256"
      }
    }

    var dk = _utils.createRandom()
    var walletStogare = { defaultAccount: '', accounts: [] }
    wallet.accounts.forEach(item => {
      var privateKey = codec.toBuffer(item.privateKey)
      var keyObject = keythereum.dump(password, privateKey, dk.salt, dk.iv, options);
      walletStogare.accounts.push(keyObject)
    })
    walletStogare.defaultAccount = wallet.defaultAccount
    return walletStogare
  },
  decode (password, walletStogare) {
    var wallettmp = { defaultAccount: '', accounts: [] }
    wallettmp.defaultAccount = walletStogare.defaultAccount
    walletStogare.accounts.forEach(keyObject => {
      var privateKey = keythereum.recover(password, keyObject)
      var account = getAccount(privateKey)
      wallettmp.accounts.push(account)
    })
    return wallettmp
  }
}

const _utils = {
  createRandom: function() {
    var keyBytes = 32, ivBytes = 16
    var random = randomBytes(keyBytes + ivBytes + keyBytes)
    return {
      iv: random.slice(keyBytes, keyBytes + ivBytes),
      salt: random.slice(keyBytes + ivBytes)
    };
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
    var account = getAccount(privateKey)
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
    if(!password) password = prompt("Please enter your password");
    var walletStogare = _storage.encode(password)
    _storage.saveData(walletStogare)
    return walletStogare.accounts.length
  }

  loadFromStorage (password) {
    var walletStogare = _storage.getData()
    if (walletStogare && walletStogare.accounts.length > 0) {
      if(!password) password = prompt("Please enter your password");
      var wallettmp = _storage.decode(password, walletStogare)
      wallet = wallettmp
      console.log('Load wallet from storage', wallet)
    }
    return wallet.accounts.length
  }
}

module.exports = Wallet
