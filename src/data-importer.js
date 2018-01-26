const fs = require('fs')

function t212ToStream(in212Json, writeStream) {
    writeStream.write("timestamp\topen\tclose\tlow\thigh\n")
    in212Json.candles
        .map(c => `${c.timestamp}\t${c.ask.open}\t${c.ask.close}\t${c.ask.low}\t${c.ask.high}\t`)
        .forEach(line => writeStream.write(line + "\n"))    
        writeStream.end()
    return Promise.resolve(true);
}

function t212Normalize(in212Json) {
    if (!in212Json.candles && in212Json[0]) in212Json = in212Json[0];
    return in212Json.candles
    .map(c => ({
        timestamp: c.timestamp, 
        data: {
            open: c.ask.open,
            close: c.ask.close,
            low: c.ask.low,
            high: c.ask.high
        }
    }));
}

exports.t212ToStream = t212ToStream
exports.t212Normalize = t212Normalize

// If used from CLI
if (process.argv[1].indexOf('data-importer.js') > -1) {
    console.log(`===========================
      Data Formatter

    `)
    if (process.argv.length == 4) {
        var file = process.argv[2]
        var out = process.argv[3]
        let inFile212
        try {
            inFile212 = require(file)
        } catch(e) {
            console.error("Error reading file " + file + ".")
            throw e
        }
        if (!inFile212) {
            throw "File " + file + " not found..."
        }
        let outFile = fs.createWriteStream(out)
        t212ToStream(inFile212, outFile).then(_ => console.log("Done"))
    } else {
        console.error("Usage: fileIn.json fileOut.txt")
    }
}
