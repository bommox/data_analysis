const { Candle } = require('./core')


class Importer {

    constructor() {}
    /**
     * 
     * @param {{candles: any[],request:{instCode:string,periodType:string}} jsonData
     */


    static getCandlesFromT212File(jsonData) {
        if (!jsonData && !jsonData.candles) throw 'No candles'
        const candles = jsonData.candles.map(rawT21 => Candle.fromT21(rawT21))
        return candles
    }


}

exports.Importer = Importer