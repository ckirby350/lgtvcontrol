require('./vars.js');

function getDateStr(xdate) {
    dateStr = xdate.getFullYear() + "-";
    if ((xdate.getMonth() + 1) < 10) {
        dateStr = dateStr + "0";
    }
    dateStr = dateStr + (xdate.getMonth() + 1);
    dateStr = dateStr + "-";
    if (xdate.getDate() < 10) {
        dateStr = dateStr + "0";
    }
    dateStr = dateStr + xdate.getDate();
    return dateStr;
}

function getDateToMinStr(xdate) {
    dateStr = getDateStr(xdate);
    dateStr = dateStr + " ";
    if (xdate.getHours() < 10) {
        dateStr = dateStr + "0";
    }
    dateStr = dateStr + xdate.getHours() + ":";
    if (xdate.getMinutes() < 10) {
        dateStr = dateStr + "0";
    }
    dateStr = dateStr + xdate.getMinutes();
    return dateStr; 
}

function getShowName(dateStr, callsign) {
    if (!dateStr || dateStr == "" || !currGuideObjs || currGuideObjs.length < 1) {
        return "";
    }
    showName = "";
    //console.log("callsign=" + callsign + " dateStr=" + dateStr);
    for (var i=0; i < currGuideObjs.length; i++) {
        if (currGuideObjs[i].channel.callsign == callsign) {
            for (var lcnt=0; lcnt < currGuideObjs[i].listings.length; lcnt++) {                           
                if (currGuideObjs[i].listings[lcnt].listDateTime <= dateStr) {
                    showName = currGuideObjs[i].listings[lcnt].showName;
                } else {
                    break;
                }
            }
            break;
        }
    }
    return showName;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

module.exports = { getDateStr, getDateToMinStr, getShowName, sleep}


