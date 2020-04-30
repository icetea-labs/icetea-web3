/* global jest describe test expect beforeAll afterAll */

const { sleep, newAccounWithBalance, web3 } = require('./helper')
const assert = require('assert')

const tweb3 = web3.ws()

const test = async () => {
    const { address: from } = await newAccounWithBalance(tweb3)

    const CONTRACT_SRC = `const {name, sender} = this.runtime.msg;if (name === 'test') this.emitEvent('test', { tester: sender }, ['tester'])`
    
    const contract = await tweb3.deploy({ data: CONTRACT_SRC })
    let count = 0
    contract.once('test', (err, event, tx) => {
        err && assert.fail(err)
        assert.equal(count, 0, 'Once run more than one.')
        count++

        assert.equal(event.eventName, 'test', 'Wrong event name')
        assert.equal(event.eventData.tester, from)
    })

    await contract.prepareMethod('test').sendCommit()
    await contract.prepareMethod('test').sendCommit()

    const second = 2
    await sleep(second * 1000)

    assert.equal(count, 1, `No event emitted within ${second} seconds.`)
}

test().finally(() => tweb3.close() )
