
const { Candle } = require('../../src/core')

describe("The Candle suit", function() {
    let candle = new Candle({
      open:12971.90000,
      max:12999.40000,
      min:12959.50000,
      close:12982.00000,
      timestamp: 1510761600000
    })

    it("checks candle props", done => {
      expect(candle.diff).toBeCloseTo(12982 - 12971.9, 4)
      expect(candle.mean).toBeCloseTo((12982 + 12971.9)*0.5, 4)
      done()
    })
  
    it("checks candle to be not equal", done =>  {
      let candleB = new Candle({
        open:12971.91000,
        max:12999.40000,
        min:12959.50000,
        close:12982.00000,
        timestamp: 1510761600000
      })
      expect(candle.equals(candleB)).toBe(false);
      done()
    });
    
    it("checks candle equals", done => {
      let candleC = new Candle({
        open:12971.90000,
        max:12999.40000,
        min:12959.50000,
        close:12982.00000,
        timestamp: 1510761600000
      })

      expect(candle.equals(candleC)).toBe(true);
      done()
    });
  });
      