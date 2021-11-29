const express = require('express');

const app = express();
var path = require('path');
var indexRouter = require('./routes/index');
var channelsRouter = require('./routes/channels');
var bodyParser = require('body-parser');
var lgtv;
var currentSelectedTV;
var getChannelsCalled = false;
var getCurrentChannelCalled = false;
var currentChannelID;
var alreadySent = false;

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.set('views', '.' + path.sep + 'views');

app.use('/', indexRouter);
app.use('/channels', channelsRouter);

app.get("/returnToMain", (req,res) => {
    lgtv.disconnect();
    res.render('index', { tvList : tvListObj });
})

app.post("/changeChannel", (req,res) => {
    console.log("Changing channel to " + req.body.channelID);
    lgtv.request('ssap://tv/openChannel', {channelId: req.body.channelID});    
    res.render('channels', { selectedTV : currentSelectedTV, channelList : lgtv.currentChannelList.channelList, currentChannelID : req.body.channelID });
})

app.get("/close", (req,res) => {
    lgtv.disconnect();
    res.render('index', { tvList : tvListObj });
})

function readyToShowChannels() {
    //if (!getChannelsCalled && !getCurrentChannelCalled) {
    if (lgtv.currentChannelList && (typeof lgtv.currentChannelList !== "undefined")
        && lgtv.currentChannelList.channelList && (typeof lgtv.currentChannelList.channelList !== "undefined")
        && lgtv.currentChannelList.channelList.length > 0 && getCurrentChannelCalled) {
        console.log("READY!");
        return true;
    }
    console.log("not ready!");
    return false;    
}

app.post("/gotoChannelsPage", (req,mainRes) => {
    var tv;    
    var selectedChannelNum;
    //console.log('selectedTV=' + req.body.selectedTV);
    for(var i = 0; i < tvListObj.length; i++) {
        tv = tvListObj[i];
        if (tv.tvNumber == req.body.selectedTV) {
            currentSelectedTV = req.body.selectedTV;            
            break;
        }
    }
    console.log("selectedTV IP=" + tv.ipAddress);
    lgtv = require('./master.js')({
        url: 'ws://' + tv.ipAddress + ':3000'
    });

    lgtv.on('error', function (err) {
        console.log(err);
        lgtv.disconnect();
        mainRes.render('index', { tvList : tvListObj });
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
                mainRes.render('channels', { selectedTV : currentSelectedTV, channelList : lgtv.currentChannelList.channelList, currentChannelID : currentChannelID });
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
                console.log("ready from current channel");
                alreadySent = true;
                mainRes.render('channels', { selectedTV : currentSelectedTV, channelList : lgtv.currentChannelList.channelList, currentChannelID : currentChannelID });
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
    res.render('index', { tvList : tvListObj });
})
***/

app.listen(3000, () => console.log("Listening on port 3000"));
