require('./vars.js');
const express = require('express');
const schedule = require('node-schedule');
const fh = require("./filehandler");
const ch = require("./channelhandler");
const app = express();
var path = require('path');
var indexRouter = require('./routes/index');
var channelsRouter = require('./routes/channels');
var scriptsRouter = require('./routes/scripts');
var bodyParser = require('body-parser');
const e = require('express');
var fs = require('fs');
const { nextTick } = require('process');
var lgtv;
var currentSelectedTV;
var currentChannelList = [];
var getChannelsCalled = false;
var getCurrentChannelCalled = false;
var currentChannelID;
var alreadySent = false;
var tvListNumberOfColumnsToShow = 6;
var selectedTVList = [];

var chunk = []
var chunkCnt = -1;
var mainCnt = 0;
for(var i = 0; i < tvListObj.length; i++) {
    chunkCnt++;
    chunk[chunkCnt] = tvListObj[i];
    if (chunkCnt == (tvListNumberOfColumnsToShow - 1)) {
        chunkedTVList[mainCnt] = chunk;
        chunkCnt = -1;
        chunk = [];
        mainCnt++;
    }
}
if (chunkCnt > -1) {
    while (chunkCnt < (tvListNumberOfColumnsToShow - 1)) {    
        chunkCnt++;
        chunk[chunkCnt] = {'ipAddress': "0.0.0.0",'tvNumber' : "EMPTY"}
    }
    chunkedTVList[mainCnt] = chunk;
}

function mainRunAndDeleteScript(scriptID, runIt) {
    //console.log("mainrunanddel id=" + scriptID + " runit=" + runIt);
    var scriptObj = scriptObjs.find(obj => {
        return obj.id === scriptID
    })
    //console.log("   scriptObj tvList=" + scriptObj.tvList + " channelID=" + scriptObj.channelID);
    if (runIt) {
        ch.changeChannels(scriptObj.tvList, scriptObj.channelID);
    }
    scriptObjs = scriptObjs.filter(function( obj ) {
        return obj.id !== scriptID;
    });    
    fileWritten = false;
    fh.writeSched();  

}

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.set('views', '.' + path.sep + 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('/public'));

app.use('/', indexRouter);
app.use('/channels', channelsRouter);
app.use('/scripts', scriptsRouter);

app.get("/returnToMain", (req,res) => {
    if (lgtv && lgtv != "undefined") {
        lgtv.disconnect();
    }
    res.render('index', { tvList : chunkedTVList });
})

app.post("/changeChannel", (req,res) => {    
    selectedTVList = req.body.tvNumsFld.split(",");
    //console.log("selected TVs:" + req.body.tvNumsFld + " selectedTVList=" + selectedTVList);
    if (selectedTVList && selectedTVList.length > 0 && selectedTVList[0] != "") {  
        if (lgtv && lgtv != "undefined") {      
            lgtv.disconnect();
        }
        ch.changeChannels(selectedTVList, req.body.channelID);
    } else {
        console.log("no TV picked to change channel for");
    }
    res.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : req.body.channelID });
})

app.get("/changeChannels", (req,res) => {
    //console.log(req.query.tvNums);
    //console.log(req.query.channelID);
    var newChannelID = req.query.channelID;
    selectedTVList = req.query.tvNums.split(",");
    if (selectedTVList && selectedTVList.length > 0 && selectedTVList[0] != "" && newChannelID && newChannelID != "") { 
        ch.changeChannels(selectedTVList, newChannelID);
    } else {
        console.log("Null/Blank tvNums and/or channelID parameters!!!");
    }
    res.render('index', { tvList : chunkedTVList });
});

app.get("/close", (req,res) => {
    lgtv.disconnect();
    res.render('index', { tvList : chunkedTVList });
})

function readyToShowChannels() {
    if (lgtv.currentChannelList && (typeof lgtv.currentChannelList !== "undefined")
        && lgtv.currentChannelList.channelList && (typeof lgtv.currentChannelList.channelList !== "undefined")
        && lgtv.currentChannelList.channelList.length > 0 && getCurrentChannelCalled) {
        console.log("READY!");
        return true;
    }
    console.log("not ready!");
    return false;    
}

app.get("/shutdown", (req,res) => {
    var tv;   
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        console.log("Shutting down TV " + tv.tvNumber);
        powerOff(tv.ipAddress);     
    }
    res.render('index', { tvList : chunkedTVList });
});

function powerOff(tvIPAddress) {
    var xlgtv;
    xlgtv = require('./master.js')({
        url: 'ws://' + tvIPAddress + ':3000'
    });

    xlgtv.on('error', function (err) {
        console.log(err);
        xlgtv.disconnect();        
    });    
    
    xlgtv.on('connect', function () {
        //console.log('connected to TV# for power off...');
        xlgtv.request('ssap://system/turnOff', function (err, res) {
            xlgtv.disconnect();
        });
    });            
}

app.post("/gotoChannelsPage", (req,mainRes) => {
    var tv;    
    var selectedChannelNum;   
    //console.log('selectedTV=' + req.body.selectedTV);
    for(var i = 0; i < tvListObj.length; i++) {        
        tv = tvListObj[i];
        if (req.body.selectedTV == "0") {
            console.log("Shutting down TV " + tv.tvNumber);
            powerOff(tv.ipAddress);           
        } else {
            if (tv.tvNumber == req.body.selectedTV) {            
                currentSelectedTV = req.body.selectedTV;  
                selectedTVList = [];
                selectedTVList[0] = req.body.selectedTV;  
                break;
            }
        }
    }
    if (req.body.selectedTV == "0") {
        mainRes.render('index', { tvList : chunkedTVList });
        return;
    }
    console.log("selectedTV IP=" + tv.ipAddress);

    if (tv.mfg == "LG") {
        lgtv = require('./master.js')({
            url: 'ws://' + tv.ipAddress + ':3000',
            timeout: 8000,
            reconnect: 0
        });

        lgtv.on('error', function (err) {
            console.log(err);
            lgtv.disconnect();
            mainRes.render('index', { tvList : chunkedTVList });
        });
        
        lgtv.on('connecting', function () {
            console.log('connecting...');
        });
        
        lgtv.on('connect', function () {
            console.log('connected to TV# ' + tv.tvNumber);
            alreadySent = false;
            getChannelsCalled = false;
            getCurrentChannelCalled = false;
            lgtv.subscribe('ssap://tv/getChannelList', function (err, res) {  
                lgtv.currentChannelList = res;
                getChannelsCalled = true;                
                if (readyToShowChannels() && !alreadySent) {
                    currentChannelList = lgtv.currentChannelList.channelList;
                    alreadySent = true;
                    console.log("ready from channel list");                
                    mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelID });
                }
                console.log("channelList length=" + lgtv.currentChannelList.channelList.length);
                console.log("Channel List:");            
                for (var chCnt=0; chCnt < lgtv.currentChannelList.channelList.length; chCnt++) {
                    console.log(' (' + chCnt + ') ' + lgtv.currentChannelList.channelList[chCnt].channelMode + ' ' + lgtv.currentChannelList.channelList[chCnt].channelNumber + ' id=' + lgtv.currentChannelList.channelList[chCnt].channelId);
                }
            });
                            
            lgtv.subscribe('ssap://tv/getCurrentChannel', function (err, res) {
                currentChannelID = res.channelId;
                getCurrentChannelCalled = true;                
                if (readyToShowChannels() && !alreadySent) {
                    currentChannelList = lgtv.currentChannelList.channelList;
                    alreadySent = true;
                    console.log("ready from current channel");
                    mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelID });
                }
                console.log("Current Channel: " + res.channelModeName + ' ' + res.channelNumber + ' id=' + res.channelId);
            });         
            return;
        });

        lgtv.on('prompt', function () {
            console.log('please authorize on TV');
        });
        
        lgtv.on('close', function () {
            console.log('close');            
        });
    }  
    if (tv.mfg == "VIZIO") {
        let smartcast = require('./vizio');
        let viziotv = new smartcast(tv.ipAddress, tv.key);

        viziotv.settings.channels.get().then((data) => {
            //console.log(data);
            channelList = data;
            for (var i=0; i < channelList.ITEMS.length; i++) {
              if (channelList.ITEMS[i].CNAME == "current_channel") {
                currentChannelNum = channelList.ITEMS[i].VALUE;
                break;
              } 
            }
            currentChannelList = vizioChannelList;
            console.log("currentChannelNum=" + currentChannelNum);
            mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelNum });

        });
    }
})

module.exports = app;

app.listen(3000, () => console.log("Listening on port 3000"));

fileRead = false;
fh.readSched();

if (!fileRead) {
    setTimeout(initSched, 1000);
    return;
}

function initSched() {
    var scriptObj;
    var job;
    var jobSpot = -1;
    if (scriptObjs && scriptObjs.length > 0) {
        for (var schedCnt=0; schedCnt < scriptObjs.length; schedCnt++) {
            scriptObj = scriptObjs[schedCnt];
            if (scriptObj.runDT && scriptObj.runDT != "") {
                now = new Date();
                schedDat = new Date(Number(scriptObj.runDT.substring(0,4)), 
                    (Number(scriptObj.runDT.substring(5,7)) - 1),
                    Number(scriptObj.runDT.substring(8,10)), 
                    Number(scriptObj.runDT.substring(11,13)), 
                    Number(scriptObj.runDT.substring(14)), 
                    0);
                //console.log("now=" + now.getTime() + " schedDat=" + schedDat.getTime());
                if (now.getTime() > schedDat.getTime()) {
                    //in the past so delete it
                    mainRunAndDeleteScript(scriptObj.id, false);
                    continue;
                }
                job = schedule.scheduleJob(schedDat, function() {
                    mainRunAndDeleteScript(scriptObj.id, true);
                });  
                jobObj = { 'id' : scriptObj.id, 'job' : job};
                jobList.push(jobObj);     
            }
        }
    }
}





