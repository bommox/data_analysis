const moment = require('moment')
const _ = require('lodash')
const slayer = require('slayer')

class Candle {
    // ..and an (optional) custom class constructor. If one is
    // not supplied, a default constructor is used instead:
    // constructor() { }
    constructor({timestamp, open, close, min, max}) {
      this.timestamp = timestamp;
      this.open = open;
      this.close = close;
      this.min = min;
      this.max = max;
      this.diff = Math.round((this.close - this.open) * 100) / 100
      this.mean = Math.round((0.5*this.close + 0.5*this.open) * 100) / 100
    }

    resumen() {
        return `[CANDLE]::${Candle.formatDate(this.timestamp)} [${this.open}->${this.close}] (${this.diff})`;
    }

    toString() {
        return this.resumen()
    }

    /**
     * 
     * @param {Candle} candle 
     */
    equals(candle) {
        return (candle && candle.timestamp == this.timestamp && candle.open == this.open && this.close == candle.close)
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

    static formatDate(date) {
        return moment(date).format("YYYY-MM-DD HH:mm")
    }
}

class Store {

    /**
     * 
     * @param {Candle[]} candles 
     */
    constructor(candles) {
        this.candles = _.sortBy(candles, 'timestamp')
        this._selectedCandles = this.candles
    }

    setRange(from, to=new Date()) {
        this._selectedCandles = this.candles.concat().filter(c => moment(c.timestamp).isBetween(from, to))
        return this._selectedCandles
    }

    getCandles() {
        return this._selectedCandles
    }

    /**
     * 
     * @param {string} field 
     * @returns {Candle}
     */
    getMax(field='mean') {
        return _.maxBy(this._selectedCandles, field)
    }
    
    /**
     * 
     * @param {string} field 
     * @returns {Candle}
     */
    getMin(field='mean') {
        return _.minBy(this._selectedCandles, field)
    }

    /**
     * 
     * @param {Candle} candle 
     * @param {number} count 
     * @returns {Candle[]}
     */
    getPrevious(candle, count=1) {
        let result = []
        let cIdx = this.getIndex(candle)
        if (cIdx > -1) {
            for (let i = cIdx - count; i < cIdx; i++) {
                if (this._selectedCandles[i] != undefined) result.push(this._selectedCandles[i])
            }
        }
        return result
    }
    
    /**
     * 
     * @param {Candle} candle 
     * @param {number} count 
     * @returns {Candle[]}
     */
    getNext(candle, count=1) {
        let result = []
        let cIdx = this.getIndex(candle)
        if (cIdx > -1) {
            for (let i = cIdx + 1; i <= cIdx + count; i++) {
                if (this._selectedCandles[i] != undefined) result.push(this._selectedCandles[i])
            }
        }
        return result
    }

    getIndex(candle) {
        for (let i = 0; i < this._selectedCandles.length; i++) {
            if (candle.equals(this._selectedCandles[i])) {
                return i
            }
        }
        return -1
    }

    async getPeaks() {
        let spikes = await slayer({minPeakHeight: 30})
        .y(c => c.mean)
        //.x(c => c)
        .transform((a, orig) => {
            a['candle'] = orig
            return a
        })
        .fromArray(this._selectedCandles)
        return spikes.map(a => a.candle)
    }
    
    async getHills() {
        let spikes = await slayer({minPeakHeight: 30})
        .y(c => 20000 - c.mean)
        //.x(c => c)
        .transform((a, orig) => {
            a['candle'] = orig
            return a
        })
        .fromArray(this._selectedCandles)
        return spikes.map(a => a.candle)
    }

}


const OP_TYPE_SELL = "SELL"
const OP_TYPE_BUY = "BUY"

class Operation {

    static get TYPE_SELL() { return OP_TYPE_SELL }
    static get TYPE_BUY() { return OP_TYPE_BUY }

    /**
     * 
     * @param { {type:string, openedCandle:Candle, stopLoss:number, takeBenefits:number, trailingStop:boolean}} param0 
     */
    constructor({ type, openedCandle, stopLoss, takeBenefits, trailingStop=false}) {
        if (this.type != Operation.TYPE_BUY || this.type != Operation.TYPE_SELL) throw `Invalid type. It must be "${Operation.TYPE_SELL}" or "${Operation.TYPE_BUY}"`
        if (!openedCandle) throw 'Invalid openedCandle field'
        if (!takeBenefits) throw 'Invalid takeBenefits field'
        if (!stopLoss) throw 'Invalid stopLoss field'
        this.openedCandle = openedCandle
        this.closedCandle = null
        this.stopLoss = this.stopLoss
        this.takeBenefits = this.takeBenefits
    }
    
    /**
     * 
     * @param {Candle} nextCandle 
     */
    process(nextCandle) {
        if (this.isClosed()) return;
        if (nextCandle.timestampt <= this.openedCandle.timestamp) return;
        const currentBenefit = (this.type == Operation.TYPE_BUY)
            ? nextCandle.mean - this.openedCandle.mean
            : this.openedCandle.mean - nextCandle.mean

        if (currentBenefit >= this.takeBenefits) {
            this.closedCandle = nextCandle
            return;
        }

        if (currentBenefit < 0 && currentBenefit*-1 >= this.stopLoss) {
            this.closedCandle = nextCandle
        }

    }

    /**
     * @returns { boolean }
     */
    isClosed() {
        return this.closedValue !== null
    }

    /**
     * @returns {{ amount:number, delayer:any }}
     */
    getResult() {
        if (!this.isClosed) throw 'Not closed!'

        let amount = (this.type == Operation.TYPE_BUY) 
            ? this.closedCandle.mean - this.openedCandle.mean
            : this.openedCandle.mean - this.closedCandle.mean

        let delayed = moment(this.closedCandle.timestamp).from(this.openedCandle.timestamp)

        return { amount, delayed }
    }


}

class Simulation {

    /**
     * 
     * @param {{store:Store, maxOperations:number, operationCreatorFn:Store=>Candle=>Operation}} store 
     */
    constructor({store, maxOperations=999, operationCreatorFn}) {
        this.store = store
        /** @type {Operation[]} */
        this.operations = []
        this.maxOperations = maxOperations
        this.operationCreator = operationCreatorFn(store)
    }


    runSimulation() {
        let i = 0
        let candles = this.store.getCandles()
        do {
            let candle = candles[i]
            // Process operations
            this.operations.filter(o => !o.isClosed()).forEach(o => {
                o.process(candle)
            })
            // Open new operations
            let newOp = this.operationCreator(candle)
            if (newOp) {
                this.operations.push(newOp)
            }
            i++
        } while(candle[i] != null)

        console.log(`${this.operations.length} operations done!`)
    }


}


exports.Candle = Candle
exports.Store = Store
exports.Simulation = Simulation
exports.Operation = Operation
