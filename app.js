const express = require('express');

const app = express();
var path = require('path');
var indexRouter = require('./routes/index');
var channelsRouter = require('./routes/channels');
var bodyParser = require('body-parser');
var lgtv;

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.set('views', '.' + path.sep + 'views');

app.use('/', indexRouter);
app.use('/channels', channelsRouter);

app.get("/returnToMain", (req,res) => {
    lgtv.disconnect();
    res.render('index', { tvList : tvListObj });
})

app.post("/gotoChannelsPage", (req,res) => {
    var tv;
    var channelList;
    var selectedChannelNum;
    //console.log('selectedTV=' + req.body.selectedTV);
    for(var i = 0; i < tvListObj.length; i++) {
        tv = tvListObj[i];
        if (tv.tvNumber == req.body.selectedTV) {
            console.log("selectedTV IP=" + tv.ipAddress);
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
        res.render('index', { tvList : tvListObj });
    });
    
    lgtv.on('connecting', function () {
        console.log('connecting...');
    });
    
    lgtv.on('connect', function () {
        console.log('connected to TV# ' + tv.tvNumber);
        
        lgtv.request('ssap://tv/getChannelList', function (err, res) {  
            lgtv.currentChannelList = res;
            console.log("channelList length=" + lgtv.currentChannelList.channelList.length);
            console.log("Channel List:");
            channelList = lgtv.currentChannelList.channelList;
            for (var chCnt=0; chCnt < channelList.length; chCnt++) {
                console.log(' (' + chCnt + ') ' + channelList[chCnt].channelMode + ' ' + channelList[chCnt].channelNumber + ' id=' + channelList[chCnt].channelId);
            }
        })

                
        lgtv.request('ssap://tv/getCurrentChannel', function (err, res) {
            console.log("Current Channel: " + res.channelModeName + ' ' + res.channelNumber + ' id=' + res.channelId);
            
            //selectedChannelNum = Number(selectedChannel);
            //lgtv.request('ssap://tv/openChannel', {channelId: lgtv.currentChannelList.channelList[selectedChannelNum].channelId});
        });   
        
        res.render('channels', { selectedTV : req.body.selectedTV, channelList : channelList });
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
