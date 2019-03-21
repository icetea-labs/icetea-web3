const { newAccount, getAccount } = require('icetea-common').utils
// var accounts = {}

function getFromStorage () {
  var dataLocal = localStorage.getItem('accounts')
  if (dataLocal) {
    dataLocal = JSON.parse(dataLocal)
  } else {
    dataLocal = {}
  }
  return dataLocal
}

function saveToStorage (account) {
  var accountsLocal = getFromStorage()
  accountsLocal[account.address] = account
  localStorage.setItem('accounts', JSON.stringify(accountsLocal))
}

class Wallet {
  createAccount () {
    var account = newAccount()
    // accounts[account.address]= account
    saveToStorage(account)
    return account
  }

  importAccount (privateKey) {
    var account = getAccount(privateKey)
    // accounts[account.address]= account
    saveToStorage(account)
    return account
  }

  getAccountByPrivateKey (privateKey) {
    return getAccount(privateKey)
  }

  getAccountByAddress (address) {
    var accountsLocal = getFromStorage()
    return accountsLocal[address]
  }

  // getAccountsByIndex (index) {
  // }

  getListAccounts () {
    return getFromStorage()
  }
}

module.exports = Wallet
