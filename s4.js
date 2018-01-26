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

const diff = e => e.data.high - e.data.low

const maxEntry = ts.max(diff)

const countNextNegatives = e => {
    let count = 0;
    let current = e;
    while (current.next() && current.next().data.open < current.data.open) {
        count++;
        current = current.next()
    }
    return count;
}

const round = math.places(2)

let e = ts.max(countNextNegatives)
let count = countNextNegatives(e)

print("Max negative serie ==>", count, e.toString())
print("La diferencia es de ", round(e.data.open - e.next(count).data.open))

const countNextPositives = e => {
    let count = 0;
    let current = e;
    while (current.next() && current.next().data.open > current.data.open) {
        count++;
        current = current.next()
    }
    return count;
}

let e2 = ts.max(countNextPositives)
let count2 = countNextPositives(e2)


print("Max positive serie ==>", count2, e2.toString())
print("La diferencia es de ", round(e2.data.open - e2.next(count2).data.open))

print("END")