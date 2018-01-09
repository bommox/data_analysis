const Candle = require('./core').Candle
const Store = require('./core').Store
const Simulation = require('./core').Simulation
const Operation = require('./core').Operation
const Promise = require('bluebird').Promise
const fs = require('fs')
const _ = require('lodash')
const moment = require('Moment')
const slayer = require('slayer')


// Async utils
const readFile = Promise.promisify(fs.readFile)


async function init() {
    try {
        console.log("Reading data...")
        let data = JSON.parse(await readFile('../test/dax-1m-180109.json'))
        console.log("Data read!")
        await processRawData(data)
        console.log("Yuhu!")
    } catch (e) {
        console.error("Error reading data!")
        console.error(e)
    }
   
    //let c1 = new Candle({open: 5, close: 10, min: 2, max: 10})
    console.info("End")    
}

/**
 * 
 * @param {{candles: any[],request:{instCode:string,periodType:string}} jsonData 
 */
async function processRawData(jsonData) {
    if (!jsonData && !jsonData.candles) throw 'No candles'
    console.log(`\n\n============ ${jsonData.request.instCode} : ${jsonData.request.periodType}`)
    const candles = jsonData.candles.map(rawT21 => Candle.fromT21(rawT21))
    return processData(candles)
}

/**
 * 
 * @param {Candle[]} candles 
 */
async function processData(candles) {
    if (!candles || candles.length === 0) return false
    let store = new Store(candles)
    console.log("El máximo es " + store.getMax())
    console.log("El open máximo es " + store.getMax('open'))

    let peaks = await store.getPeaks()
    console.log('Peaks', peaks.map(c => c.toString()))
    let hills = await store.getHills()
    console.log('Hills', hills.map(c => c.toString()))

    await simulate(store)
    return true
}

/**
 * 
 * @param {Store} store 
 */
async function simulate(store) {
    console.log(`
    ======= SIMULATE ========
    `)
    let simulation = new Simulation({
        store: store,
        operationCreatorFn: store => candle => {


            // FIXME Actually oepration is created just after peak/hill !!!

            if (store.getHills().map(c => c.timestamp).indexOf(candle.timestamp) > -1) {
                return new Operation({
                    openedCandle: candle,
                    stopLoss : 50,
                    takeBenefits: 20,
                    type: Operation.TYPE_BUY
                })
            } else if (store.getPeaks().map(c => c.timestamp).indexOf(candle.timestamp) > -1) {
                return new Operation({
                    openedCandle: candle,
                    stopLoss : 50,
                    takeBenefits: 20,
                    type: Operation.TYPE_SELL
                })
            }


        }
        
    })

    simulation.runSimulation()

    console.log(`
    ##END
    `)
    return true
}

init()