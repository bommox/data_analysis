const Candle = require('./core').Candle
const bluebird = require('bluebird')
const fs = require('fs')

// Async utils
const readFile = bluebird.Promise.promisify(fs.readFile)


async function init() {
    let data;
    try {
        console.log("Reading data...")
        data = JSON.parse(await readFile('../test/dax-1h.json'))
        console.log("Data read!")
        await processData(data)
    } catch (e) {
        console.error("Error reading data!")
        console.error(e)
    }
   
    //let c1 = new Candle({open: 5, close: 10, min: 2, max: 10})
    console.info("End")    
}

/**
 * 
 * @param {{candles: any[]}} jsonData 
 */
async function processData(jsonData) {
    if (!jsonData && !jsonData.candles) throw 'No candles'
    const candles = jsonData.candles.map(rawT21 => Candle.fromT21(rawT21))
    candles.forEach(c => console.log(c.diff()))
}

init()