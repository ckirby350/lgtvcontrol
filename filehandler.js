require('./vars.js');
var fs = require('fs');

function readGuide(dateStr, callback) {   
    var foundTodaysGuide = false; 
    var guideFileName = "../data/guide" + dateStr + ".json";
    console.log("reading guideFileName=" + guideFileName + "...");
    fs.readFile(guideFileName, function(err, data) {              
        if (err) {
            console.log("Can't read " + guideFileName);            
        } else {
            if (data && data != "undefine" && data != "" && data.length > 0) {
                foundTodaysGuide = true;                
            }
        } 
        if (callback !== undefined) {
            callback(foundTodaysGuide, data);
        }            
    }
  );
}

function writeGuide(dateStr, guideJSON, callback) {  
    var guideWritten = false;
    var guideFileName = "../data/guide" + dateStr + ".json";  
    fs.writeFile(guideFileName, JSON.stringify(guideJSON, null, 4), err => {
        // Checking for errors
        if (err) {
            console.log("Can't write " + guideFileName);
            console.log(err);
        } else {
            guideWritten = true;
        }
        if (callback !== undefined) {
            callback(guideWritten, JSON.stringify(guideJSON));
        }    
    });
}

function readSched() {
    if (!fileWritten) {
        setTimeout(readSched, 1000);
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

module.exports = { readSched, writeSched, readGuide, writeGuide }

