require('./vars.js');
var changingChannel = false;

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

module.exports = { changeChannels }