require('../vars.js');
var express = require('express');
var router = express.Router();
var badTVList = [];
var listOfTVsToCheckConnection = [];
var iselectedTVList = []

router.get('/', function(req, res, next) {
    res.render('index', { selectedTV : '', tvList : tvListObj, selectedTVList : iselectedTVList, 
        channelList : staticChannelList, currentChannelID : '', currentChannelNumber : '' });
    //res.render('index', { tvList : chunkedTVList, badTVList: [] });
});

function tvChecked(tvNum) {
    //console.log("Check for TV # " + tvNum + " complete...");
    var tvnumSpot = listOfTVsToCheckConnection.indexOf(tvNum);
    if (tvnumSpot > -1) {
        listOfTVsToCheckConnection.splice(tvnumSpot, 1);
    }
    //console.log("listtocheck len=" + listOfTVsToCheckConnection.length + " badTVList len=" + badTVList.length);
}

function connCheck(tvMfg, tvIPAddr, tvNum, tvKey) {
    var xlgtv; 
    if (tvMfg == "LG") {
        xlgtv = require('../master.js')({
            url: 'ws://' + tvIPAddr + ':3000',
            timeout: 8000,
            reconnect: 0
        });

        xlgtv.on('error', function (err) {
            console.log(err);
            tvChecked(tvNum);
            badTVList[badTVList.length] = tvNum;
            xlgtv.disconnect();        
        });    
            
        xlgtv.on('connect', function () { 
            tvChecked(tvNum);               
            xlgtv.disconnect();
        });     
    } 
    if (tvMfg == "VIZIO") {
        let smartcast = require('../vizio');
        viziotv = new smartcast(tvIPAddr, tvKey);
        var channelPromise = viziotv.settings.channels.get();
        channelPromise.then((data) => {
            tvChecked(tvNum);      
        }).catch(err => { 
            badTVList[badTVList.length] = tvNum;
            tvChecked(tvNum);
            //console.log("promise err " + err); 
        });
    }  
}

router.get("/healthCheck", (req,res) => {
    console.log("in index router /healthCheck");
    var tv;   
    badTVList = [];
    ips = []
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        if (ips.indexOf(tv.ipAddress) > -1) {
            continue;
        }
        ips.push(tv.ipAddress);
        listOfTVsToCheckConnection[listOfTVsToCheckConnection.length] = tv.tvNumber; 
        //if (tv.mfg == "LG") {     
        connCheck(tv.mfg, tv.ipAddress, tv.tvNumber, tv.key);
    }  
    checkToReturn(res);
})

function checkToReturn(res) {
    if (listOfTVsToCheckConnection.length > 0) {
        setTimeout(checkToReturn, 1000, res);
        return;
    }
    console.log("returning from healthCheck...");
    var sortedList = [];
    for (var i=0; i < badTVList.length; i++) {
        sortedList[sortedList.length] = Number(badTVList[i]);
    }
    sortedList.sort(function(a, b){return a-b});
    res.json({badTVList: sortedList });
}

module.exports = router;