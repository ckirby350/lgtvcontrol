require('../vars.js');
const app = require('../app')
const uuid = require('uuid').v4;
const fh = require("../filehandler");
const ch = require("../channelhandler");
const schedule = require('node-schedule');
var express = require('express');
var fs = require('fs');
var router = express.Router();
var currentScript;
var scriptSelectedTVNums = [];
var channelsReturned = false;
var scriptAvailChannelList = [];

router.post("/save", (req,res) => { 
    var scriptObj;   
    var fndIt = false;
    var tvIPListStr = "";
    var selectedTV;
    /***/
    console.log("script save name=" + req.body.nameFld);
    console.log("              id=" + req.body.scriptID);
    console.log("             tvs=" + req.body.selectedTVNums);
    console.log("        channel=" + req.body.selectedChannelID + " " + req.body.selectedChannelNumber);
    console.log("            date=" + req.body.runDTdateFld + " hr=" + req.body.runDThrFld + " min=" + req.body.runDTmnFld + " ampm=" + req.body.runDTampmFld);
    
    var tvArray = req.body.selectedTVNums.split(",");
    runDTStr = "";
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
    if (req.body.runDTdateFld && req.body.runDTdateFld != "undefined" && req.body.runDTdateFld != "") {
        runDTDate = new Date(req.body.runDTdateFld);
        hr = Number(req.body.runDThrFld);
        if (req.body.runDTampmFld == "AM" && hr == 12) {
            hr = 0;
        }
        if (req.body.runDTampmFld == "PM" && hr != 12) {
            hr = hr + 12;
        }
        runDTDate.setHours(hr);
        runDTDate.setMinutes(req.body.runDTmnFld);
        yr = runDTDate.getFullYear();        
        mo = "";
        if ((runDTDate.getMonth() + 1) < 10) { mo = "0"; }
        mo = mo + (runDTDate.getMonth() + 1);
        da = "";
        if (runDTDate.getDate() < 10) { da = "0"; }
        da = da + runDTDate.getDate();
        hr = "";
        if (runDTDate.getHours() < 10) { hr = "0"; }
        hr = hr + runDTDate.getHours();
        mn = 0;
        if (runDTDate.getMinutes() < 10) { mn = "0"; }
        mn = mn + runDTDate.getMinutes();
        runDTStr = yr + "-" + mo + "-" + da + " " + hr + ":" + mn;
        //console.log("runDTStr=" + runDTStr);

        schedDat = new Date(Number(yr), (Number(mo) - 1), Number(da), Number(hr), Number(mn), 0);
        //console.log("schedDat=" + runDTStr);        

        job = schedule.scheduleJob(schedDat, function() {
            runAndDeleteScript(req.body.scriptID, true);
        });
        jobObj = { 'id' : req.body.scriptID, 'job' : job};
        jobList.push(jobObj);   
    }
    scriptObj = { 'id' : req.body.scriptID, 'name' : req.body.nameFld, 'tvIPs' : tvIPListStr,
            'channelID' : req.body.selectedChannelID, 'channelNumber' : req.body.selectedChannelNumber,
            'tvList' : req.body.selectedTVNums, 'runDT' : runDTStr};
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
    fh.writeSched();
    fileRead = false;
    fh.readSched();
    checkToRender(res);    
})

function runAndDeleteScript(scriptID, runIt) {
    console.log("scripts runanddel id=" + scriptID);
    var scriptObj = scriptObjs.find(obj => {
        return obj.id === scriptID
    })
    //console.log("   scriptObj tvList=" + scriptObj.tvList + " channelID=" + scriptObj.channelID);
    if (runIt) {
        ch.changeChannels(scriptObj.tvList, scriptObj.channelID, scriptObj.channelNumber);
    }
    scriptObjs = scriptObjs.filter(function( obj ) {
        return obj.id !== scriptID;
    });    
    fileWritten = false;
    fh.writeSched();  
}

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
    fh.readSched();
    checkToRender(res);    
});

router.get('/scheduleScript', function(req, res, next) {
    for (var i=0; i < scriptObjs.length; i++) {
        if (scriptObjs[i].id == req.query.scriptID) {
            currentScript = { 'id' : uuid(), 'name' : scriptObjs[i].name + "_torun", 
                'runDT' : '', 'tvIPs' : scriptObjs[i].tvIPs, 'tvList' : scriptObjs[i].tvList,
                'channelID' : scriptObjs[i].channelID, 'channelNumber' : scriptObjs[i].channelNumber};
            break;
        }
    }    
    if (currentScript.tvList && currentScript.tvList != "undefined" && currentScript.tvList != "") {
        scriptSelectedTVNums = currentScript.tvList.split(",");
    }
    res.render('scriptedit', { currentScript : currentScript, channelList : staticChannelList, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
});

router.get('/new', function(req, res, next) {
    scriptSelectedTVNums = [];
    currentScript = { 'id' : uuid(), 'name' : '', 'runDT' : '', 'tvIPs' : '', 'tvList' : '', 'channelID' : '', 'channelNumber' : ''};
    res.render('scriptedit', { currentScript : currentScript, channelList : staticChannelList, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
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
    for (var jobcnt=0; jobcnt < jobList.length; jobcnt++) {
        jobObj = jobList[jobcnt];
        if (jobObj.id == req.params.scriptID) {
            jobObj.job.cancel();
        }
    }
    jobList = jobList.filter(function( obj ) {
        return obj.id !== req.params.scriptID;
    });
    res.json({scriptObjs: scriptObjs });    
    fileWritten = false;
    fh.writeSched();    
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
    if (tv.mfg == "LG") {
        xlgtv = require('../master.js')({
            url: 'ws://' + tv.ipAddress + ':3000',
            timeout: 8000,
            reconnect: 0
        });

        xlgtv.on('error', function (err) {
            channelsReturned = true;
            console.log(err);
            xlgtv.disconnect();
            mainRes.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : selectedTVList, 
            channelList : staticChannelList, currentChannelID : '', currentChannelNumber : ''});
        });    
        
        xlgtv.on('connect', function () {
            console.log('connected to TV# ' + tv.tvNumber);
            //xlgtv.request('ssap://system.notifications/createToast', {message: 'Channel List coming!'});
            xlgtv.subscribe('ssap://tv/getChannelList', function (err, res) {  
                scriptAvailChannelList = res.channelList;  
                channelsReturned = true;  
                xlgtv.disconnect();               
            });   
        });
        
        
        xlgtv.on('prompt', function () {
            console.log('please authorize on TV');
        });
    }
    if (tv.mfg == "VIZIO") {
        scriptAvailChannelList = staticChannelList;
        channelsReturned = true;  
    }

    checkToReturn(mainRes);
});

module.exports = router;
