// Dependencias
const t212clean = require('./src/data-importer').t212Normalize
const fs = require('fs')
const TS = require('./src/time-serie').TimeSerie
const print = console.log.bind(console)
const file = require('./src/file')
const date = require('./src/date')
const math = require('./src/math')

// Carga de datos
let rawData = require('./data/ndaq-10m.json')

// Se crea el ts (time-serie)
let data = t212clean(rawData)
let ts = new TS(data)

//////////////////////////////////////////////////////////////


const dataReducer = (a,b) => ({
    open: a.open,
    close: b.close,
    high: Math.max(a.high, b.high),
    low: Math.min(a.low, b.low)
})

const hourTs = ts.groupInNewSerie(6, dataReducer)


print('Original', ts.entries().length)
print('Hours', hourTs.entries().length)

const diff = e => e.data.high - e.data.low

print('Max diff original', diff(ts.max(diff)))
print('Max diff by hour', diff(hourTs.max(diff)))

const headers = ['ts,open,close,low,high'.split(",")]
const printer = e => [e.timestamp, e.data.open, e.data.close, e.data.low, e.data.high]

file.save('out/' + date.now() + '.original.txt', headers.concat(ts.entries().map(printer) ))
file.save('out/' + date.now() + '.byhour.txt', headers.concat(hourTs.entries().map(printer) ) )