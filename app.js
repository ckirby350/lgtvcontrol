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
var changingChannel = false;

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('/public'));

app.use('/', indexRouter);
app.use('/channels', channelsRouter);

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
        if (selectedTVList.length == 1 && selectedTVList.includes(currentSelectedTV)) {
            //console.log("just change this current TVs channel");
            console.log("Changing channel to " + req.body.channelID);
            lgtv.request('ssap://tv/openChannel', {channelId: req.body.channelID});
        } else {
            //console.log("change a few or other TV....");
            lgtv.disconnect();
            changeChannels(selectedTVList, req.body.channelID);
        }
    } else {
        console.log("no TV picked to change channel for");
    }
    res.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : lgtv.currentChannelList.channelList, currentChannelID : req.body.channelID });
})

app.get("/changeChannels", (req,res) => {
    //console.log(req.query.tvNums);
    //console.log(req.query.channelID);
    var newChannelID = req.query.channelID;
    selectedTVList = req.query.tvNums.split(",");
    if (selectedTVList && selectedTVList.length > 0 && selectedTVList[0] != "" && newChannelID && newChannelID != "") { 
        changeChannels(selectedTVList, newChannelID);
    } else {
        console.log("Null/Blank tvNums and/or channelID parameters!!!");
    }
    res.render('index', { tvList : chunkedTVList });
});

function changeTVChannel(tvIPAddr, newChannelID) {
    changingChannel = true;
    console.log("Changing TV IP " + tvIPAddr + " to channel " + newChannelID);
    var xlgtv;
    xlgtv = require('./master.js')({
        url: 'ws://' + tvIPAddr + ':3000',
        timeout: 8000,
        reconnect: 0
    });

    xlgtv.on('error', function (err) {
        console.log(err);
        xlgtv.disconnect();        
        changingChannel = false;
    });    
    
    xlgtv.on('connect', function () {
        xlgtv.request('ssap://tv/openChannel', {channelId: newChannelID}, function (err) {
            xlgtv.disconnect();
            changingChannel = false;
        });
    });      
}

function okToChangeChannel(tvIPAddr, newChannelID) {
    //console.log("okToChangeChannel tvIPAddr=" + tvIPAddr + " changingChannel=" + changingChannel);
    if (changingChannel) {
        setTimeout(okToChangeChannel, 1000, tvIPAddr, newChannelID);
        return;
    }
    changeTVChannel(tvIPAddr, newChannelID);
}

function changeChannels(tvNumsToChange, newChannelID) {
    var tv;   
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        if (tvNumsToChange.includes(tv.tvNumber)) {
            okToChangeChannel(tv.ipAddress, newChannelID);         
        }
    }  
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
                alreadySent = true;
                console.log("ready from channel list");                
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
                mainRes.render('channels', { selectedTV : currentSelectedTV, tvList : tvListObj, selectedTVList : selectedTVList, channelList : lgtv.currentChannelList.channelList, currentChannelID : currentChannelID });
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
    
})


module.exports = app;

/*** 
app.get('/', (req,res) => {
    res.render('index', { tvList : chunkedTVList });
})
***/

app.listen(3000, () => console.log("Listening on port 3000"));
