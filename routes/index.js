var express = require('express');
var router = express.Router();
var badTVList = [];
var listOfTVsToCheckConnection = [];

router.get('/', function(req, res, next) {
    res.render('index', { tvList : chunkedTVList, badTVList: [] });
});

function tvChecked(tvNum) {
    console.log("Check for TV # " + tvNum + " complete...");
    var tvnumSpot = listOfTVsToCheckConnection.indexOf(tvNum);
    if (tvnumSpot > -1) {
        listOfTVsToCheckConnection.splice(tvnumSpot, 1);
    }
    console.log("listtocheck len=" + listOfTVsToCheckConnection.length + " badTVList len=" + badTVList.length);
}

function connCheck(tvIPAddr, tvNum) {
    var xlgtv; 
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

router.get("/healthCheck", (req,res) => {
    var tv;   
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        listOfTVsToCheckConnection[listOfTVsToCheckConnection.length] = tv.tvNumber; 
        connCheck(tv.ipAddress, tv.tvNumber);      
    }  
    checkToReturn(res);
})

function checkToReturn(res) {
    if (listOfTVsToCheckConnection.length > 0) {
        setTimeout(checkToReturn, 1000, res);
        return;
    }
    res.json({badTVList: badTVList });
}

module.exports = router;