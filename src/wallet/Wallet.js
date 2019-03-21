const { newAccount, getAccount } = require('icetea-common').utils

function getFromStorage () {
  var dataLocal = localStorage.getItem('accounts')
  if (dataLocal) {
    dataLocal = JSON.parse(dataLocal)
  } else {
    dataLocal = []
  }
  return dataLocal
}

function saveToStorage (account) {
  var accountsLocal = getFromStorage()
  // accountsLocal[account.address] = account
  accountsLocal.push(account)
  localStorage.setItem('accounts', JSON.stringify(accountsLocal))
}

class Wallet {
  constructor () {
    this.accounts = getFromStorage()
  }

  createAccount () {
    var account = newAccount()
    // accounts[account.address]= account
    this.accounts.push(account)
    saveToStorage(account)
    return account
  }

  importAccount (privateKey) {
    var account = getAccount(privateKey)
    // accounts[account.address]= account
    this.accounts.push(account)
    saveToStorage(account)
    return account
  }

  getAccountByPrivateKey (privateKey) {
    return getAccount(privateKey)
  }

  getAccountByAddress (address) {
    var accountsLocal = getFromStorage()
    for (i = 0; i < accountsLocal.length; i++) {      
      if (accountsLocal[i].address == address) {
         return accountsLocal[i]
      }
    }
  }
}

module.exports = Wallet
