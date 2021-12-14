require('./vars.js');
var fs = require('fs');

function readSched() {
    if (!fileWritten) {
        setTimeout(readSched);
        return;
    }
    fs.readFile(fileName, function(err, data) {
        if (err) {
            fileRead = true;
            console.log("Can't read " + fileName);
            return;
        }
        if (data && data != "undefine" && data != "" && data.length > 0) {
            scriptObjs = JSON.parse(data);
        }
        fileRead = true;
        console.log("sched data: " + data); 
    });
}

function writeSched() {    
    fs.writeFile(fileName, JSON.stringify(scriptObjs, null, 4), err => {
        fileWritten= true;
        // Checking for errors
        if (err) {
            console.log("Can't write " + fileName);
            return; 
        }
       
        //console.log("Done writing"); // Success
    });
}

module.exports = { readSched, writeSched }

