// Dependencias
const t212clean = require('./src/data-importer').t212Normalize
const fs = require('fs')
const TS = require('./src/time-serie').TimeSerie
const print = console.log.bind(console)
const file = require('./src/file')
const date = require('./src/date')
const math = require('./src/math')

// Carga de datos
let rawData = require('./data/ndaq-1m.json')

// Se crea el ts (time-serie)
let data = t212clean(rawData)
let ts = new TS(data)

//////////////////////////////////////////////////////////////

let first = ts.first()
const round = math.places(4)

let balance = ts.entries().filter(e => e.index > 0).map(e => [e.index, round(e.data.close - e.previous().data.close)])
file.save(`out/balance-${date.now()}.txt`, balance)
    .then(_ => print("END"))
    .catch(e => print(e))

print("END")