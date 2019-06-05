const { IceteaWeb3 } = require('../src')
const tweb3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

async function test () {
  try {
    tweb3.wallet.createAccount()
    const contract = tweb3.contract('teat1hlc9hsymx6flhuj0epg62lsu0qyz3z5hsatg4q')
    let result = await contract.methods.value().call()
    // console.log('getValue return value: ', result)

    // result = await tweb3.subscribe('Tx', {}, (err, data) => {
    //     console.error('subscribe error: ', err)
    //     console.log('subscribe data: ', data)
    // })
    // console.log('subscribe return value: ', result)

    result = await contract.events.DataSet((err, data, full) => {
      console.error('contract subscribe error: ', err)
      console.log('contract subscribe data: ', data)
    })
    console.log('contract subscribe return value: ', result)

    // result = await result.unsubscribe()
    // console.log('unsubscribe return value: ', result)

    result = await contract.methods.setValue(Date.now()).sendCommit()
    // console.log('setResult return value: ', result)

    result = await contract.methods.setValue(100).sendCommit()

    // result = await tweb3.getPastEvents('ValueSet')
    // console.log('getPastEventResult: ', result)
  } catch (err) {
    console.log('Global error', err)
  }

  setTimeout(() => {
    tweb3.close()
  }, 10000)
}

test()

// contract.events.ValueSet({}, function(error, data) {
// 	if (error) {
// 		console.error(error)
// 		byId('value').textContent = String(error)
// 	} else {
// 		byId('value').textContent = data.eventData.newValue
// 	}
// })
