const { Store } = require('../../src/core')
const { Importer } = require('../../src/utils')
const fs = require('fs')

describe("The Store suit", function() {

  let fileContent = JSON.parse(fs.readFileSync('./test/test-data-t21.json'))
  let candles = Importer.getCandlesFromT212File(fileContent)

  const store = new Store(candles)
  
  it("gets the min", done => {
    expect(store.getMin().mean).toBeCloseTo(13351.7, 4)
    done()
  })
  
  it("gets the max", done => {
    expect(store.getMax().mean).toBeCloseTo(13385.05, 4)
    expect(store.getMax('mean').mean).toBeCloseTo(13385.05, 4)
    done()
  })

  it("gets the max by close", done => {
    expect(store.getMax('close').mean).toBeCloseTo(13383.45, 4)
    done()
  })

  it("gets previous", done => {
    expect(store.getPrevious(candles[5])[0].timestamp).toBe(candles[4].timestamp)
    done()
  })
  
  it("gets next", done => {
    expect(store.getNext(candles[5])[0].timestamp).toBe(candles[6].timestamp)
    done()
  })

  it("gets next 498", done => {
    expect(store.getNext(candles[498]).length).toBe(1)
    done()
  })

  it("gets prev 0", done => {
    expect(store.getPrevious(candles[0]).length).toBe(0)
    done()
  })

});
    