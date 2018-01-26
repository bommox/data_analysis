
class TimeEntry {

    /**
     * 
     * @param {TimeSerie} timeserie 
     * @param {number} timestamp 
     * @param {any} data 
     */
    constructor(timeserie,timestamp, data) {
        this._serie = timeserie
        this.timestamp = timestamp
        this.data = data
        this.index = timeserie._ts.indexOf(timestamp)
    }


    serie() {
        return this._serie
    }

    next(offset) {
        return this._serie.next(this, offset)
    }
    
    previous(offset) {
        return this._serie.previous(this, offset)
    }

    nextN(count) {
        let result = []
        for (let i = 1; i <= count; i++) {
            let next = this.next(i)
            if (next) result.push(next)
        }
        return result;
    }    

    previousN(count) {
        let result = []
        for (let i = 1; i <= count; i++) {
            let next = this.previous(i)
            if (next) result.push(next)
        }
        return result;
    }

    equals(obj) {
        return (obj && obj.timestamp == this.timestamp && obj['data'] !== undefined)
    }

    toString() {
        return `#${this.index} :: ${this.timestamp} :: ${JSON.stringify(this.data)}`
    }

}

class TimeSerie {


    /**
     * 
     * @param {{timestamp:number, data:any}} dataArray 
     */
    constructor(dataArray) {
        this._validateRaw(dataArray)
        this._ts = []
        this._entryMap = {}

        dataArray.forEach(raw => {
            this._ts.push(raw.timestamp)
            this._entryMap[raw.timestamp] = new TimeEntry(this, raw.timestamp, raw.data)            
        })
        //this._timeDelta = dataArray[1].timestamp - dataArray[0].timestamp
        //ERROR ! y los festivos?
    }

    _validateRaw(data) {
        if (!data) throw 'Data is null'
        if (!data.length > 2) throw 'No data in the array'
        const delta = data[1].timestamp - data[0].timestamp
        for (let i = 3; i < data.length; i++) {
            let current = data[i]
            if (current.timestamp < data[i-1].timestamp) throw "Invalid timestamps " + current.timestamp + " !> " + data[i-1].timestamp
        }
    }

    get(timestamp) {
        return this._entryMap[timestamp]
    }

    contains(tsOrEntry) {
        if (typeof tsOrEntry == 'number') {
            return this._ts.indexOf(tsOrEntry) > -1
        } else if(tsOrEntry.timestamp) {
            return this.get(tsOrEntry.timestamp).equals(tsOrEntry)
        } else {
            return false
        }
    }
    
    first() {
        return this._entryMap[this._ts[0]]
    }

    last() {
        return this._entryMap[this._ts[this._ts.length - 1]]
    }

    next(entry, offset) {
        offset = offset || 1
        let index = this._ts.indexOf(entry.timestamp) + offset
        return this._entryMap[this._ts[index]]
    }
    
    previous(entry, offset) {
        offset = offset || 1
        let index = this._ts.indexOf(entry.timestamp) - offset
        return this._entryMap[this._ts[index]]
    }

    isFirst(entry) {
        return this.first().equals(entry)
    }
    
    isLast(entry) {
        return this.last().equals(entry)
    }

    min(predicate) {
        if (!typeof predicate == 'function') throw 'Predicate must be a function'
        var minValue, minTs;
        this._ts.forEach(ts => {
            var e = this._entryMap[ts]
            var value = predicate(e)
            if (!minValue || value < minValue) {
                minValue = value
                minTs = ts
            } 
        })
        return this._entryMap[minTs]
    }

    max(predicate) {
        if (!typeof predicate == 'function') throw 'Predicate must be a function'
        var maxValue, maxTs;
        this._ts.forEach(ts => {
            var e = this._entryMap[ts]
            var value = predicate(e)
            if (!maxValue || value > maxValue) {
                maxValue = value
                maxTs = ts
            } 
        })
        return this._entryMap[maxTs]
    }

    filter(predicate) {
        if (!typeof predicate == 'function') throw 'Predicate must be a function'
        return this._ts.map(ts => this._entryMap[ts]).filter(predicate)
    }

    entries() {
        return this._ts.map(ts => this._entryMap[ts])
    }

    groupInNewSerie(numPerGroup, dataGrouperFn) {
        if (!typeof dataGrouperFn == 'function') throw 'dataGrouperFn must be a function'
        let newEntries = []
        for (let i = 0; i < this._ts.length; i+=numPerGroup) {
            let entries = []
            for (let j = i; j < i + numPerGroup; j++) {
                entries.push(this._entryMap[this._ts[j]])
            }
            let newEntryData = entries.filter(e => e != undefined).map(e => e.data).reduce(dataGrouperFn)
            let newEntryTs = entries[0].timestamp
            newEntries.push({
                timestamp : newEntryTs,
                data: newEntryData
            })
        }
        return new TimeSerie(newEntries)
    }

    iterator() {
        let entry = -1
        return {
            hasNext : _ => entry == -1 || entry.next() != undefined,
            next : _ => entry = (entry == -1) ? this.first() : entry.next()
        }
    }

}

exports.TimeSerie = TimeSerie