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

class Position {

    constructor(entry) {
        this.open = entry
    }

    close(entry) {
        this.close = entry
    }

    isOpen() {
        return this.close != undefined
    }

}

class Simulation {

    constructor() {
        this.positions = []
        this._current = undefined
    }

    open(entry) {
        if (this._current) throw 'Can\'t open new operation. One in progress'
        this._current = new Position(entry)
    }

    close(entry) {
        this._current.close(entry)
        this.positions.push(this._current)
        this._current = undefined
    }

    currentOperation() {
        return this._current
    }


}


let it = ts.iterator()
let sim = new Simulation()

while(it.hasNext()) {
    let entry = it.next()
    if (!sim.currentOperation()) {
        sim.open(entry)
    } else {
        let operationEntry = sim.currentOperation().open
        if (entry.data.open - operationEntry.data.open > 32) {
            sim.close(entry)
        } else if (entry.data.open - operationEntry.data.open < -60) {
            sim.close(entry)
        }
    }
}

let result = math.places(2)(sim.positions.map(p => p.close.data.open - p.open.data.open).reduce((a,b) => a+b))

print('Shorter position is ', Math.min.apply(null, sim.positions.map(p => p.close.timestamp - p.open.timestamp)) / (1000 * 60 * 60), 'hours' )
print('Longer position is ', Math.max.apply(null, sim.positions.map(p => p.close.timestamp - p.open.timestamp)) / (1000 * 60 * 60), 'hours' )

print(`Opened ${sim.positions.length} position with a result of ${result}eur`)
