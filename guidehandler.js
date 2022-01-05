require('./vars.js');
const fh = require("./filehandler");
var request = require("request")

function parseGuideResults(foundTodaysGuide, guideJSONStr) {
    var dispStr = "";    
    //if (!currGuideObjs || currGuideObjs == "undefined" || currGuideObjs.length < 1) {
    if (!foundTodaysGuide) {
        console.log("empty guide / not found");
        //call out to service to get new grid list for today
        var currDT = new Date();
        var endDateStr = "";
        var utcDateStr = currDT.toISOString();
        var colSpot = utcDateStr.lastIndexOf(":");
        utcDateStr = utcDateStr.substring(0, colSpot);
        currDT.setHours( currDT.getHours() + 14 );
        endDateStr = currDT.toISOString();
        colSpot = endDateStr.lastIndexOf(":");
        endDateStr = endDateStr.substring(0, colSpot);
        //console.log("start=" + utcDateStr + " end=" + endDateStr);
        getTVMediaGuide(utcDateStr, endDateStr);
    } 
    try {
        currGuideObjs = JSON.parse(guideJSONStr);
    } catch (e) {
        console.log("guide JSON parse error: " + e);
        console.log(guideJSONStr);
        currGuideObjs = [];
    }
    /*** for debugging / testing ***********************************************************
    if (currGuideObjs && currGuideObjs.length > 0) {
        for (var gcnt=0; gcnt < 2; gcnt++) {
            dispStr = currGuideObjs[gcnt].channel.network;
            for (var lcnt=0; lcnt < currGuideObjs[gcnt].listings.length; lcnt++) {
                dispStr = dispStr + " " + currGuideObjs[gcnt].listings[lcnt].listDateTime.substring(11,16);
                dispStr = dispStr + " " + currGuideObjs[gcnt].listings[lcnt].showName;
            }
            console.log("------------------------------------------------------------------");
            console.log(dispStr);
        }    
    }
    *****************************************************************************************/
}

function getGuide(startDateStr) { 
    console.log("getGuide for " + startDateStr.substring(0,10));       
    fh.readGuide(startDateStr.substring(0,10), parseGuideResults);  
}

function getTVMediaGuide(startStr, endStr) {  
    gnowStr = "";
    gnowDT = new Date();
    gnowStr = gnowDT.getFullYear() + "-" + (gnowDT.getMonth() + 1) + "-" + gnowDT.getDate();  
    if (tvMediaDateFetchedAttempts.indexOf(gnowStr) > -1) {
        console.log(gnowStr + " already had tvmedia fetch attempt!!!");
        return;
    }
    tvMediaDateFetchedAttempts.push(gnowStr);
    url = "http://api.tvmedia.ca/tv/v4/lineups/" + tvMediaLinupNum + "/listings/grid?api_key=" + tvMediaAPIKey + "&timezone=" + tvMediaTimezone + "&start=" + startStr + "&end=" + endStr;
    console.log("going to fetch url=" + url);
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("guide found");
            //console.log(JSON.stringify(body)); 
            fh.writeGuide(gnowStr, body, parseGuideResults);            
        } else {
            console.log("guide fetch err=" + error);
        }
    });
}

function getAmazeGuide(dateStr) {
    url = "http://api.tvmaze.com/schedule?country=US&date=" + dateStr;    

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            //console.log(body[0]);
            //console.log(body) // Print the json response
            var listing;
            var sortedList = [];
            for (var gcnt=0; gcnt < body.length; gcnt++) {
                listing = body[gcnt];
                //console.log(listing.airtime);
                if (listing && listing != "undefined" && listing.show.network && listing.show.network != "undefined") {                    
                    sortedList.push({"networkId" : Number(listing.show.network.id), "networkName" : listing.show.network.name,
                        "airTime" : listing.airtime, "showName" : listing.show.name});                   
                }
            }
            sortedList.sort((a, b) => (a.networkId > b.networkId) ? 1 : (a.networkId === b.networkId) ? ((a.airTime > b.airTime) ? 1 : -1) : -1 );
            var currentNetworkId = 0;
            var dispStr = "";

            for (var i=0; i < sortedList.length; i++) {
                if (sortedList[i].networkId != currentNetworkId) {
                    if (currentNetworkId > 0) {
                        console.log(dispStr);
                    }
                    currentNetworkId = sortedList[i].networkId;
                    dispStr = sortedList[i].networkId + ":" + sortedList[i].networkName;
                }
                dispStr = dispStr + " " + sortedList[i].airTime + " " + sortedList[i].showName;
                //console.log(sortedList[i]);
            }
            console.log(dispStr);
        }
    });
}

module.exports = { getGuide }