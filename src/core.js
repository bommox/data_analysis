class Candle {
    // ..and an (optional) custom class constructor. If one is
    // not supplied, a default constructor is used instead:
    // constructor() { }
    constructor({timestamp, open, close, min, max}) {
      this.open = open;
      this.close = close;
      this.min = min;
      this.max = max;
    }

    resumen() {
        return `Opened at ${this.open}, closes at ${this.close}, difference: ${this.close - this.open}`;
    }

    diff() {
        return this.close - this.open
    }

    /**
     * 
     * @param {*} data 
     * @returns {Candle} newCandle
     */
    static fromT21(data) {
        if (!data) throw "Data empty"
        return new Candle({
            timestamp: data.timestamp,
            open: data.ask.open,
            close: data.ask.close,
            min: data.ask.low,
            max: data.ask.max,
        })
    }
}
exports.Candle = Candle