require('./vars.js');
const express = require('express');
const schedule = require('node-schedule');
const fh = require("./filehandler");
const ch = require("./channelhandler");
const gh = require("./guidehandler");
const strf = require("./strfuncts.js");
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

currentChannelList = staticChannelList;

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

if (showGuide) {
    var nowStr = "";
    var nowDT = new Date();
    nowStr = nowDT.getFullYear() + "-" + (nowDT.getMonth() + 1) + "-" + nowDT.getDate();
    gh.getGuide(nowStr);
    //gh.getGuide("2021-12-21");
}

/********************************************************************************************
 *  use this to get a list of network callsigns for populating staticChannels in vars network property
 ***************************************
fh.readGuide("2021-12-21", listNetworks);
function listNetworks(foundIt, xdata) { 
    var networkList = [];   
    xguideObjs = JSON.parse(xdata);
    if (xguideObjs && xguideObjs.length > 0) {
        for (var gcnt=0; gcnt < xguideObjs.length; gcnt++) {
            networkStr = xguideObjs[gcnt].channel.callsign + "-" + xguideObjs[gcnt].channel.network;  
            if (networkStr && networkStr != "") {
                if (networkList.indexOf(networkStr) < 0) {
                    networkList.push(networkStr);
                }
            }          
        } 
        networkList.sort();
        for (var i=0; i < networkList.length; i++) {
            console.log(networkList[i]);
        }
    }
}
************************************************************************************************/


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
    selectedTVList = [];
    if (currGuideObjs && currGuideObjs != "undefined" && currGuideObjs.length > 0) {
        var channel;
        gnowDateStr = strf.getDateToMinStr(new Date()) + ":00";        
        for (var cnt=0; cnt < staticChannelList.length; cnt++) {
            channel = { 'channelId' : staticChannelList[cnt].channelId, 'channelMode' : staticChannelList[cnt].channelMode,
                'channelNumber' : staticChannelList[cnt].channelNumber, 'network' : staticChannelList[cnt].network,
                'currProgram' : strf.getShowName(gnowDateStr, staticChannelList[cnt].network)}
            staticChannelList[cnt] = channel;
        }
    }
    res.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
        channelList : staticChannelList, currentChannelID : '', currentChannelNumber : '' });
    //res.render('index', { tvList : chunkedTVList });
})

app.post("/changeChannel", (req,res) => {    
    selectedTVList = req.body.tvNumsFld.split(",");
    //console.log("selected TVs:" + req.body.tvNumsFld + " selectedTVList=" + selectedTVList + " new channelid=" + req.body.channelID);
    if (selectedTVList && selectedTVList.length > 0 && selectedTVList[0] != "") {  
        if (lgtv && lgtv != "undefined") {      
            lgtv.disconnect();
        }
        ch.changeChannels(selectedTVList, req.body.channelID, req.body.channelNumber);
    } else {
        console.log("no TV picked to change channel for");
    }
    //res.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : req.body.channelID, currentChannelNumber : req.body.channelNumber });
    res.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
        channelList : staticChannelList, currentChannelID : req.body.channelID, currentChannelNumber : req.body.channelNumber });
})

app.get("/updateTVKey", (req,res) => {
    tvNumToUpdate = req.query.tvNumber;
    keyToUpdate = req.query.key;
    tvSpot = tvListObj.findIndex(x => x.tvNumber === tvNumToUpdate);
    if (tvSpot < 0) {
        res.json({"error" : "TV " + tvNumToUpdate + " not found!!"});
    }
    tvObj = tvListObj[tvSpot];
    tvObj.key = keyToUpdate;
    tvListObj[tvSpot] = tvObj;
    res.json({tv: tvObj });    
});

app.get("/changeChannels", (req,res) => {
    //console.log(req.query.tvNums);
    //console.log(req.query.channelID);
    var newChannelID = req.query.channelID;
    var newChannelNumber = req.query.channelNumber;
    selectedTVList = req.query.tvNums.split(",");
    if (selectedTVList && selectedTVList.length > 0 && selectedTVList[0] != "" && newChannelID && newChannelID != "") { 
        ch.changeChannels(selectedTVList, newChannelID, newChannelNumber);
    } else {
        console.log("Null/Blank tvNums and/or channelID parameters!!!");
    }
    if (currGuideObjs && currGuideObjs != "undefined" && currGuideObjs.length > 0) {
        var channel;
        gnowDateStr = strf.getDateToMinStr(new Date()) + ":00";        
        for (var cnt=0; cnt < staticChannelList.length; cnt++) {
            channel = { 'channelId' : staticChannelList[cnt].channelId, 'channelMode' : staticChannelList[cnt].channelMode,
                'channelNumber' : staticChannelList[cnt].channelNumber, 'network' : staticChannelList[cnt].network,
                'currProgram' : strf.getShowName(gnowDateStr, staticChannelList[cnt].network)}
            staticChannelList[cnt] = channel;
        }
    }
    res.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
        channelList : staticChannelList, currentChannelID : newChannelID, currentChannelNumber : newChannelNumber });
    //res.render('index', { tvList : chunkedTVList });
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
        powerOff(tv.ipAddress, tv.mfg, tv.key);     
    }
    if (currGuideObjs && currGuideObjs != "undefined" && currGuideObjs.length > 0) {
        var channel;
        gnowDateStr = strf.getDateToMinStr(new Date()) + ":00";        
        for (var cnt=0; cnt < staticChannelList.length; cnt++) {
            channel = { 'channelId' : staticChannelList[cnt].channelId, 'channelMode' : staticChannelList[cnt].channelMode,
                'channelNumber' : staticChannelList[cnt].channelNumber, 'network' : staticChannelList[cnt].network,
                'currProgram' : strf.getShowName(gnowDateStr, staticChannelList[cnt].network)}
            staticChannelList[cnt] = channel;
        }
    }
    res.render('index', { tvList : chunkedTVList });
});

function powerOff(tvIPAddress, mfg, key) {    
    var xlgtv;
    if (mfg == "LG") {
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
    if (mfg == "VIZIO") {
        let smartcast = require('./vizio');
        let viziotv = new smartcast(tvIPAddress, key);
        var powerPromise = viziotv.control.power.off();
        powerPromise.then(() => {   
        }).catch(err => {            
            //console.log("promise err " + err); 
        });

    }     
    if (mfg == "SONY") {
        bravia = require('./bravialib/sonytv');
        bravia(tvIPAddress, key, function(client) {
            client.exec('PowerOff');
        });
    }   
    if (mfg == "SAMSUNG") {
        SamsungTv = require('./samsunglib/SamsungTv');
        deviceConfig = {
            ip: tvIPAddress,
            appId: samsungAppId,
            userId: samsungUserId,
          }
        //console.log(deviceConfig);
        samtv = new SamsungTv(deviceConfig);
        samtv.init()
            .then(() => samtv.confirmPin(key))
            .then(() => samtv.connect())
            .then(() => {
                //KEY_POWER for newer models
                samtv.sendKey('KEY_POWEROFF');                
            })
            .then(() => samtv.connection.socket.close());
    }
}

app.post("/gotoChannelsPage", (req,mainRes) => {
    var tv;    
    var selectedChannelNum;   
    //console.log('selectedTV=' + req.body.selectedTV);
    for(var i = 0; i < tvListObj.length; i++) {        
        tv = tvListObj[i];
        if (req.body.selectedTV == "0") {
            console.log("Shutting down TV " + tv.tvNumber);
            powerOff(tv.ipAddress, tv.mfg, tv.key);           
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
        if (currGuideObjs && currGuideObjs != "undefined" && currGuideObjs.length > 0) {
            var channel;
            gnowDateStr = strf.getDateToMinStr(new Date()) + ":00";        
            for (var cnt=0; cnt < staticChannelList.length; cnt++) {
                channel = { 'channelId' : staticChannelList[cnt].channelId, 'channelMode' : staticChannelList[cnt].channelMode,
                    'channelNumber' : staticChannelList[cnt].channelNumber, 'network' : staticChannelList[cnt].network,
                    'currProgram' : strf.getShowName(gnowDateStr, staticChannelList[cnt].network)}
                staticChannelList[cnt] = channel;
            }
        }
        mainRes.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
        channelList : staticChannelList, currentChannelID : '', currentChannelNumber : '' });
        //mainRes.render('index', { tvList : chunkedTVList });
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
            mainRes.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
            channelList : staticChannelList, currentChannelID : '', currentChannelNumber : '' });
        });
        
        lgtv.on('connecting', function () {
            console.log('connecting...');
        });
        
        lgtv.on('connect', function () {
            console.log('connected to TV# ' + tv.tvNumber);
            alreadySent = false;
            getChannelsCalled = false;
            getCurrentChannelCalled = false;
            if (!staticChannelList || staticChannelList.length < 1) {
                lgtv.subscribe('ssap://tv/getChannelList', function (err, res) {  
                    lgtv.currentChannelList = res;
                    getChannelsCalled = true;     
        
                    if (readyToShowChannels() && !alreadySent) {
                        currentChannelList = lgtv.currentChannelList.channelList;
                        alreadySent = true;
                        console.log("ready from channel list");                
                        mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelID, currentChannelNumber : currentChannelNumber });
                    }
                    console.log("channelList length=" + lgtv.currentChannelList.channelList.length);
                    console.log("Channel List:");            
                    for (var chCnt=0; chCnt < lgtv.currentChannelList.channelList.length; chCnt++) {
                        console.log(' (' + chCnt + ') ' + lgtv.currentChannelList.channelList[chCnt].channelMode + ' ' + lgtv.currentChannelList.channelList[chCnt].channelNumber + ' id=' + lgtv.currentChannelList.channelList[chCnt].channelId);
                    }
                });
            } else {
                getChannelsCalled = true;
                currentChannelList = staticChannelList;
                lgtv.currentChannelList.channelList = staticChannelList;
            }
                            
            lgtv.subscribe('ssap://tv/getCurrentChannel', function (err, res) {
                currentChannelID = res.channelId;
                getCurrentChannelCalled = true;                
                if (readyToShowChannels() && !alreadySent) {
                    currentChannelList = lgtv.currentChannelList.channelList;
                    alreadySent = true;
                    console.log("ready from current channel");
                    mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelID, currentChannelNumber : currentChannelNumber });
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
            currentChannelList = staticChannelList;
            console.log("currentChannelNum=" + currentChannelNum);
            mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : currentChannelList, currentChannelID : currentChannelID, currentChannelNumber: currentChannelNumber });

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





