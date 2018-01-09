const Candle = require('./core').Candle
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
        let data1m = JSON.parse(await readFile('../test/dax-1m.json'))
        let data5m = JSON.parse(await readFile('../test/dax-5m.json'))
        let data30m = JSON.parse(await readFile('../test/dax-30m.json'))
        let data1h = JSON.parse(await readFile('../test/dax-1h.json'))
        console.log("Data read!")
        await Promise.all([
            processRawData(data1m),
            processRawData(data5m),
            processRawData(data30m),
            processRawData(data1h)
        ])
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
    const candles = jsonData.candles
        .map(rawT21 => Candle.fromT21(rawT21))
        .filter(candle => moment(candle.timestamp).isBetween(
            moment("20180102","YYYYMMDD"),
            moment("20180106","YYYYMMDD")
         ))
    //candles.forEach(c => console.log(c.diff()))
    return processData(candles)
}

/**
 * 
 * @param {Candle[]} candles 
 */
async function processData(candles) {
    if (!candles || candles.length === 0) return false
    let min = _.minBy(candles, 'open')
    console.log("El open minimo es " + min.resumen())
    let max = _.maxBy(candles, 'open')
    console.log("El open maximo es " + max.resumen())
    let diffMax =  _.maxBy(candles, c => Math.abs( c.diff() ))
    console.log("La diferencia maximo es " + diffMax.resumen())

    let spikes = await slayer({minPeakHeight : 50})
        .y(c => c.open)
        .x(c => Candle.formatDate(c.timestamp))
        .fromArray(candles)

    console.log(spikes)

    return true
}

init()