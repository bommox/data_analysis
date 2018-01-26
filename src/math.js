
module.exports = {

    places: places => num => Number(num).toFixed(places),

    
    maxIndex: predicate => arr => {
        let index = -1
        let max = undefined
        let v = [].concat(arr).map(predicate)
        for (let i = 0; i < arr.length; i++) {
            if (max === undefined || v[i] > max) {
                max = v[i]
                index = i
            }
        }
        return index
    },
    
        
    minIndex: predicate => arr => {
        let index = -1
        let min = undefined
        let v = [].concat(arr).map(predicate)
        for (let i = 0; i < arr.length; i++) {
            if (min === undefined || v[i] < min) {
                min = v[i]
                index = i
            }
        }
        return index
    }

}