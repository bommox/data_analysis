const t212clean = require('./src/data-importer').t212Normalize
const fs = require('fs')
const TS = require('./src/time-serie').TimeSerie
const math = require('./src/math')
const moment = require('moment')

let rawData = require('./data/' + process.argv[2] + '.json')
let data = t212clean(rawData)

let ts = new TS(data)

const print = (...msgs) => {
    console.log.apply(console, msgs.map(m => "" + m))
}

print("first -> ", ts.first())
print("second -> ", ts.next(ts.first()))
print("undefined -> ", ts.previous(ts.first(), 1))

print("true -> ", ts.next(ts.next(ts.first())).equals(ts.next(ts.first(), 2)))
print("last -> ", ts.last())

print("Range (minutes)", (ts.last().timestamp - ts.first().timestamp) / (1000*60) )


print("Min open -> ", ts.min(e => e.data.open))
print("Max open -> ", ts.max(e => e.data.open))
print("open < 6644 -> ", ts.filter(e => e.data.open < 6644).length)
print("open < 6645 -> ", ts.filter(e => e.data.open < 6645).length)


const isPositive = e => e && e.data.close > e.data.open
const isNegative = e => e && e.data.close < e.data.open
const nextIsPositive = e => isPositive(e.next())
const nextIsNegative = e => isNegative(e.next())

print("negative -> ", ts.entries().filter(isNegative).length)
print("positive -> ", ts.entries().filter(isPositive).length)
print("negative & nextIsPositive -> ", ts.entries().filter(isNegative).filter(nextIsPositive).length)
print("negative & nextIsNegative -> ", ts.entries().filter(isNegative).filter(isNegative).length)
print("positive & nextIsPositive -> ", ts.entries().filter(isPositive).filter(nextIsPositive).length)
print("positive & nextIsNegative -> ", ts.entries().filter(isPositive).filter(nextIsNegative).length)


print("First 3", ts.first().nextN(3).map(e => e.timestamp))

const isPeak = (back, front) =>  e => {
    if (!e.previous(back) || !e.next(front)) return false;

    let prevEntries = e.previousN(back)
    let nextEntries = e.nextN(front)

    // Tomaremos el valor de open como referencia... pero podría ser cualquiera
    let value = e => e.data.open
   // print(prevEntries.map(value))
  //  print(value(e))
   // print(nextEntries.map(value))
    return ( math.maxIndex(value)( [e].concat(nextEntries)) === 0  && math.maxIndex(value)( [e].concat(prevEntries)) === 0)
}

let entry = ts.get( 1515139200000)
var peack6_2 = isPeak(10,10)
print("Is Peack: ", peack6_2(entry))

print("Peacks", ts.filter(peack6_2).map(e =>  [e.timestamp,moment(e.timestamp).format("MM-DD hh:mm"), e.data.open]).join("\n"))

//print("MaxIndex", math.maxIndex(n => n)([2,4,8,5,7,3,15,2,3]))




console.log("END")
