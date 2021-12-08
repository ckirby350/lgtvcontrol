require('./vars.js');
const express = require('express');

const app = express();
var path = require('path');
var indexRouter = require('./routes/index');
var channelsRouter = require('./routes/channels');
var bodyParser = require('body-parser');
const e = require('express');
var lgtv;
var currentSelectedTV;
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

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.set('views', '.' + path.sep + 'views');

app.use('/', indexRouter);
app.use('/channels', channelsRouter);

app.get("/returnToMain", (req,res) => {
    lgtv.disconnect();
    res.render('index', { tvList : chunkedTVList });
})

app.post("/changeChannel", (req,res) => {
    console.log("Changing channel to " + req.body.channelID);
    selectedTVList = req.body.tvNumsFld.split(",");
    console.log("selected TVs:" + req.body.tvNumsFld + " selectedTVList=" + selectedTVList);
    if (selectedTVList && selectedTVList.length > 0) {        
        if (selectedTVList.length == 1 && selectedTVList.includes(currentSelectedTV)) {
            console.log("just change this current TVs channel");
        } else {
            console.log("change a few or other TV....");
        }
    } else {
        console.log("no TV picked to change channel for");
    }
    lgtv.request('ssap://tv/openChannel', {channelId: req.body.channelID});    
    res.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : lgtv.currentChannelList.channelList, currentChannelID : req.body.channelID });
})

function changeChannels(tvNumsToChange, newChannelID) {

}

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
    lgtv = require('./master.js')({
        url: 'ws://' + tv.ipAddress + ':3000'
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
                alreadySent = true;
                console.log("ready from channel list");
                console.log("selectedTVList1=" + selectedTVList);
                mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : lgtv.currentChannelList.channelList, currentChannelID : currentChannelID });
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
                alreadySent = true;
                console.log("ready from current channel");                
                console.log("selectedTVList1=" + selectedTVList);
                mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : lgtv.currentChannelList.channelList, currentChannelID : currentChannelID });
            }
            console.log("Current Channel: " + res.channelModeName + ' ' + res.channelNumber + ' id=' + res.channelId);
 
            //selectedChannelNum = Number(selectedChannel);
            //lgtv.request('ssap://tv/openChannel', {channelId: lgtv.currentChannelList.channelList[selectedChannelNum].channelId});
        });         
        return;
    });
    
    
    lgtv.on('prompt', function () {
        console.log('please authorize on TV');
    });
    
    lgtv.on('close', function () {
        console.log('close');            
    });
    
})


module.exports = app;

/*** 
app.get('/', (req,res) => {
    res.render('index', { tvList : chunkedTVList });
})
***/

app.listen(3000, () => console.log("Listening on port 3000"));
