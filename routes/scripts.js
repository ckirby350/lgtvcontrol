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
var channelAndTVs = [];

router.post("/save", (req,res) => { 
    var scriptObj;   
    var fndIt = false;
    var tvIPListStr = "";
    var selectedTV;
    runDTStr = "";
    /***/
    console.log("script save name=" + req.body.nameFld);
    console.log("              id=" + req.body.scriptID);
    console.log("             tvs=" + req.body.selectedTVNums);
    console.log("        channel=" + req.body.selectedChannelID + " " + req.body.selectedChannelNumber);
    console.log("            date=" + req.body.runDTdateFld + " hr=" + req.body.runDThrFld + " min=" + req.body.runDTmnFld + " ampm=" + req.body.runDTampmFld);
    
    channelIDSaveVal = "";
    tvArray = [];
    mtvs = req.body.selectedTVNums.split("|");
    mChannels = req.body.selectedChannelNumber.split("|");
    for (var mccnt=0; mccnt < mChannels.length; mccnt++) {
        if (channelIDSaveVal && channelIDSaveVal.length > 0) {
            channelIDSaveVal = channelIDSaveVal + "|";
        }
        for (var i=0; i < staticChannelList.length; i++) {
            if (staticChannelList[i].channelNumber == mChannels[mccnt]) {
                channelIDSaveVal = channelIDSaveVal + staticChannelList[i].channelId;
                break;
            }
        }

        tvArray = mtvs[mccnt].split(",");
        if (tvIPListStr && tvIPListStr.length > 0) {
            tvIPListStr = tvIPListStr + "|";
        }
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
            'channelID' : channelIDSaveVal, 'channelNumber' : req.body.selectedChannelNumber,
            'tvList' : req.body.selectedTVNums, 'runDT' : runDTStr,
            'mtvList' : mtvs, 'mchList' : mChannels};
    console.log("scriptObjs.length=" + scriptObjs.length + " scriptObj.id=" + scriptObj.id);
    for (var i=0; i < scriptObjs.length; i++) {
        console.log("   id[" + i + "]=" + scriptObjs[i].id);
        if (scriptObjs[i].id == scriptObj.id) {
            fndIt = true;
            console.log("found scriptID: " + scriptObj.id + " at pos " + i);
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
        mtvs = scriptObj.tvList.split("|");
        mChannels = scriptObj.channelID.split("|");
        mChnum = scriptObj.channelNumber.split("|");
        for (var mccnt=0; mccnt < mChannels.length; mccnt++) {
            tvArr = mtvs[mccnt].split(",");
            ch.changeChannels(tvArr, mChannels[mccnt], mChnum[mccnt]);
        }
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

router.get('/editScript', function(req, res, next) {
    for (var i=0; i < scriptObjs.length; i++) {
        if (scriptObjs[i].id == req.query.scriptID) {
            mtvs = scriptObjs[i].tvList.split("|");
            mChannels = scriptObjs[i].channelNumber.split("|");
            currentScript = { 'id' : scriptObjs[i].id, 'name' : scriptObjs[i].name, 
                'runDT' : '', 'tvIPs' : scriptObjs[i].tvIPs, 'tvList' : scriptObjs[i].tvList,
                'channelID' : scriptObjs[i].channelID, 'channelNumber' : scriptObjs[i].channelNumber,
                'mtvList' : mtvs, 'mchList' : mChannels};
            break;
        }
    }    
    if (currentScript.tvList && currentScript.tvList != "undefined" && currentScript.tvList != "") {
        scriptSelectedTVNums = currentScript.tvList.split(",");
        channelAndTVs.splice(0,channelAndTVs.length);
        channelNumberList = currentScript.channelNumber.split("|");
        tvNumberList = currentScript.tvList.split("|");
        for (var i=0; i < channelNumberList.length; i++) {
            channelAndTVs[i] = { 'channelNumber' : channelNumberList[i], 'tvList' : tvNumberList[i]};
        }        
    }
    res.render('scriptedit', { channelAndTVs : channelAndTVs, currentScript : currentScript, channelList : staticChannelList, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
});


router.get('/scheduleScript', function(req, res, next) {
    for (var i=0; i < scriptObjs.length; i++) {
        if (scriptObjs[i].id == req.query.scriptID) {
            mtvs = scriptObjs[i].tvList.split("|");
            mChannels = scriptObjs[i].channelNumber.split("|");
            currentScript = { 'id' : uuid(), 'name' : scriptObjs[i].name + "_torun", 
                'runDT' : '', 'tvIPs' : scriptObjs[i].tvIPs, 'tvList' : scriptObjs[i].tvList,
                'channelID' : scriptObjs[i].channelID, 'channelNumber' : scriptObjs[i].channelNumber,
                'mtvList' : mtvs, 'mchList' : mChannels};
            break;
        }
    }    
    if (currentScript.tvList && currentScript.tvList != "undefined" && currentScript.tvList != "") {
        scriptSelectedTVNums = currentScript.tvList.split(",");
        channelAndTVs.splice(0,channelAndTVs.length);
        channelNumberList = currentScript.channelNumber.split("|");
        tvNumberList = currentScript.tvList.split("|");
        for (var i=0; i < channelNumberList.length; i++) {
            channelAndTVs[i] = { 'channelNumber' : channelNumberList[i], 'tvList' : tvNumberList[i]};
        }    
    }
    res.render('scriptedit', { channelAndTVs : channelAndTVs, currentScript : currentScript, channelList : staticChannelList, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
});

router.get('/runScript', function(req, res, next) {
    currentScript = '';
    mtvs = [];
    mChannels = [];
    tvArr = [];
    console.log("run now scriptID=" + req.query.scriptID);
    for (var i=0; i < scriptObjs.length; i++) {
        if (scriptObjs[i].id == req.query.scriptID) {
            mtvs = scriptObjs[i].tvList.split("|");
            mChannels = scriptObjs[i].channelID.split("|");
            mChnum = scriptObjs[i].channelNumber.split("|");
            currentScript = scriptObjs[i];
            console.log("run now FOUND IT!!!");
            break;
        }
    }    
    if (currentScript && currentScript != "undefined" && currentScript != "" &&
            currentScript.tvList && currentScript.tvList != "undefined" && currentScript.tvList != "") {       
        for (var mccnt=0; mccnt < mChannels.length; mccnt++) {
            tvArr = mtvs[mccnt].split(",");
            ch.changeChannels(tvArr, mChannels[mccnt], mChnum[mccnt]);
        }
    }
    res.render('scripts', { scriptObjs : scriptObjs });
});


router.get('/new', function(req, res, next) {
    scriptSelectedTVNums = [];
    channelAndTVs.splice(0,channelAndTVs.length);
    currentScript = { 'id' : uuid(), 'name' : '', 'runDT' : '', 'tvIPs' : '', 'tvList' : '', 'channelID' : '', 'channelNumber' : '', 'mtvList' : [], 'mchList' : []};
    res.render('scriptedit', { channelAndTVs : channelAndTVs, currentScript : currentScript, channelList : staticChannelList, tvList : tvListObj, scriptSelectedTVNums : scriptSelectedTVNums });
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
