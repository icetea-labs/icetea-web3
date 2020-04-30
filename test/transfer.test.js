/* global jest describe test expect beforeAll afterAll */

const { ecc } = require('@iceteachain/common')
const { sleep, newAccounWithBalance, web3 } = require('./helper')

jest.setTimeout(30000)

let tweb3 = web3.ws()
let account100 // this key should have 100 tea before running test suite
beforeAll(async () => {
  account100 = await newAccounWithBalance(tweb3)
})

afterAll(() => {
  tweb3.close()
})

describe('transfer', () => {
  test('transfer and events', async () => {
    const { address: from } = account100

    const to = ecc.newBankKeyBuffers().address
    const value = 2
    const fee = 1

    const result = await tweb3.transfer(to, value, { fee })
    expect(result.deliver_tx.code).toBeFalsy()
    expect(typeof result.hash).toBe('string')
    await sleep(1000)
    const tx = await tweb3.getTransaction(result.hash)

    // events must be correct
    const evData = tweb3.utils.decodeTxEvents(tx)
    expect(evData.length).toBe(2) // tx & transfer

    const evTx = evData.filter(e => e.eventName === 'tx')
    expect(evTx.length).toBe(1)
    expect(evTx[0].eventData.from).toBe(from)
    expect(evTx[0].eventData.to).toBe(to)

    const evData2 = tweb3.utils.decodeTxEvents(result)
    expect(evData).toEqual(evData2)

    // since value > 0, a system 'transfer' event must be emitted
    const ev2 = evData2.filter(e => e.eventName === 'transfer')
    expect(ev2.length).toBe(1)
    expect(ev2[0]).toEqual({
      emitter: 'system',
      eventName: 'transfer',
      eventData: { from, to, payer: from, value }
    })

    // now we try with get past event
    let r = await tweb3.searchTransactions(`tx.height=${result.height} AND system._ev='transfer'`)
    expect(evData).toEqual(r.txs[0].events)

    r = await tweb3.getContractEvents('system', 'tx', { filter: {to}})
    delete r[0].tx
    expect(r).toEqual(evTx)

    r = await tweb3.getContractEvents('system', 'transfer', { filter: {to}})
    delete r[0].tx
    expect(r).toEqual(ev2)

    r = await tweb3.getContractEvents('system', 'allEvents', null, { order_by: 'desc'})
    const transferEvs = r.filter(e => (e.eventName === 'transfer' && e.eventData.to === to))
    expect(transferEvs.length).toBe(1)
    expect(transferEvs[0].eventData.value).toBe(value)

    // confirm order_by desc works
    let height = 0
    r.reverse().forEach(e => {
        const newHeight = +e.tx.height
        expect(newHeight).toBeGreaterThanOrEqual(height)
        height = newHeight
    })
  })
})
