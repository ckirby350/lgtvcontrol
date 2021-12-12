require('../vars.js');
const uuid = require('uuid').v4;
var express = require('express');
var fs = require('fs');
var router = express.Router();
var scriptObjs = [];
var currentScript;
var fileName = "../data/scriptsched.json"
var fileRead = false;
var fileWritten = true;
var scriptSelectedTVNums = [];
var channelsReturned = false;
var scriptAvailChannelList = [];

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

router.post("/save", (req,res) => { 
    var scriptObj;   
    var fndIt = false;
    var tvIPListStr = "";
    var selectedTV;
    /***/
    console.log("script save name=" + req.body.nameFld);
    console.log("              id=" + req.body.scriptID);
    console.log("             tvs=" + req.body.selectedTVNums);
    console.log("        channels=" + req.body.selectedChannelID);
    console.log("            date=" + req.body.runDTdateFld + " hr=" + req.body.runDThrFld + " min=" + req.body.runDTmnFld + " ampm=" + req.body.runDTampmFld);
    
    var tvArray = req.body.selectedTVNums.split(",");
    for (var i=0; i < tvArray.length; i++) {
        if (i > 0) {
            tvIPListStr = tvIPListStr + ",";
        }
        for (var tcnt=0; tcnt < tvListObj.length; tcnt++) {
            tv = tvListObj[tcnt];
            if (tv.tvNumber == tvArray[i]) {
                break;
            }
        }
        tvIPListStr = tvIPListStr + tv.ipAddress;
    }
    scriptObj = { 'id' : req.body.scriptID, 'name' : req.body.nameFld, 'tvIPs' : tvIPListStr,
            'channelNum' : req.body.selectedChannelID, 'tvList' : req.body.selectedTVNums};
    for (var i=0; i < scriptObjs.length; i++) {
        if (scriptObjs[i].scriptID == scriptObj.id) {
            fndIt = true;
            scriptObjs[i] = scriptObj;
            break;
        }
    }    
    if (!fndIt) {        
        //scriptObjs[scriptObjs.length] = scriptObj;
        console.log("going to add script: " + JSON.stringify(scriptObj));
        scriptObjs.push(scriptObj);
    }
    fileWritten = false;
    writeSched();
    fileRead = false;
    readSched();
    checkToRender(res);    
})

function checkToRender(res) {
    if (!fileRead || !fileWritten) {
        setTimeout(checkToRender, 1000, res);
        return;
    }
    //console.log("in scripts router about to render page...");
    res.render('scripts', { scriptObjs : scriptObjs });
}

router.get('/', function(req, res, next) {
    fileRead = false;
    readSched();
    checkToRender(res);    
});

router.get('/new', function(req, res, next) {
    currentScript = { 'scriptID' : uuid(), 'name' : 'Test Name', 'runDT' : '2021-12-31 11:59:00'};
    res.render('scriptedit', { currentScript : currentScript, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
});

function checkToReturn(res) {
    if (!channelsReturned) {
        setTimeout(checkToReturn, 1000, res);
        return;
    }
    /*** 
    console.log("Scripts Channel List:");            
    for (var chCnt=0; chCnt < scriptAvailChannelList.length; chCnt++) {
        console.log(' (' + chCnt + ') ' + scriptAvailChannelList[chCnt].channelMode + ' ' + scriptAvailChannelList[chCnt].channelNumber + ' id=' + scriptAvailChannelList[chCnt].channelId);
    }
    ***/
    res.json({scriptAvailChannelList: scriptAvailChannelList });    
}

router.get("/delete/:scriptID", (req,res) => {
    scriptObjs = scriptObjs.filter(function( obj ) {
        return obj.id !== req.params.scriptID;
    });
    res.json({scriptObjs: scriptObjs });    
    fileWritten = false;
    writeSched();    
});

router.get("/getChannels/:tvNum", (req,mainRes) => {
    channelsReturned = false;
    scriptAvailChannelList = [];
    var xlgtv;
    var tv;
    console.log("getChannels tvNum=" + req.params.tvNum);
    for (var i=0; i < tvListObj.length; i++) {
        if (tvListObj[i].tvNumber == req.params.tvNum) {
            tv = tvListObj[i];
            break;
        }
    }
    xlgtv = require('../master.js')({
        url: 'ws://' + tv.ipAddress + ':3000',
        timeout: 8000,
        reconnect: 0
    });

    xlgtv.on('error', function (err) {
        channelsReturned = true;
        console.log(err);
        xlgtv.disconnect();
        mainRes.render('index', { tvList : chunkedTVList });
    });    
    
    xlgtv.on('connect', function () {
        console.log('connected to TV# ' + tv.tvNumber);
        xlgtv.request('ssap://system.notifications/createToast', {message: 'Hello World!'});
        xlgtv.subscribe('ssap://tv/getChannelList', function (err, res) {  
            scriptAvailChannelList = res.channelList   
            channelsReturned = true;  
            xlgtv.disconnect();               
        });   
    });
    
    
    xlgtv.on('prompt', function () {
        console.log('please authorize on TV');
    });

    checkToReturn(mainRes);
});

module.exports = router;