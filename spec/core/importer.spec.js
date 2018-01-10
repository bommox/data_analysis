const { Importer } = require('../../src/utils')
const fs = require('fs')

describe("The Importer suit", function() {

  
  it("imports T212 file", done => {
      let fileContent = JSON.parse(fs.readFileSync('./test/test-data-t21.json'))
      let candles = Importer.getCandlesFromT212File(fileContent)
      expect(candles.length).toBe(500)
      expect(candles[499].timestamp).toBe(1515484560000)
      done()
    })

  });
      