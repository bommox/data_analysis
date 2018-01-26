const fs = require('fs')


function toString(txt) {

    if (typeof txt == "string") {
        return txt 
    } else if (Array.isArray(txt)) {
        return txt.map(toString).join("\t")
    } else {
        let result = "" + txt
        try {
            result = JSON.stringify(txt)
        } catch(e) {}
        return result
    }
    
}

exports.save = function(fileName, content) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(fileName)) {
            reject(`File ${fileName} exists`)
            return
        }
        let file = fs.createWriteStream(fileName)    
        if (Array.isArray(content)) {
            content.forEach(line => file.write(toString(line)+"\n"))
        } else {
            file.write(toString(content))
        }
        file.end()
        resolve(true)
    })
}