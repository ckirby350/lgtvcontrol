require('./vars.js');
var changingChannel = false;
var okToNavigate = true;

function changeTVChannel(tvIPAddr, mfg, key, newChannelID) {
    changingChannel = true;
    var xlgtv;
    console.log("Changing TV IP " + tvIPAddr + " mfg=" + mfg + " to channel " + newChannelID);
    if (mfg == "LG") {
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
    if (mfg == "VIZIO") {
        let smartcast = require('./vizio');
        let viziotv = new smartcast(tvIPAddr, key);
        okToNavigate = true;
        navigate(viziotv, "ok");
        for (var i=0; i < newChannelID.length; i++) {
            switch(newChannelID[i]) {
                case "1":
                    press1(viziotv);
                    break;
                case "2":
                    press2(viziotv);
                    break;
                case "3":
                    press3(viziotv);
                    break;
                case "4":
                    press4(viziotv);
                    break;
                case "5":
                    press5(viziotv);
                    break;
                case "6":
                    press6(viziotv);
                    break;
                case "7":
                    press7(viziotv);
                    break;
                case "8":
                    press8(viziotv);
                    break;
                case "9":
                    press9(viziotv);
                    break;
                case "0":
                    press0(viziotv);
                    break;
                case "-":
                    pressDash(viziotv);
                    break;
            }
        }
        pressEnter(viziotv);
    } 
}

function navigate(viztv, direction) {
    if (!okToNavigate) {
        setTimeout(navigate, 400, viztv, direction);
        return;
    }
    okToNavigate = false;
    switch (direction) {        
        case "left":
            viztv.control.navigate.left().then((value) => {
                okToNavigate = true;
            });
            break;
        case "right":
            viztv.control.navigate.right().then((value) => {
                okToNavigate = true;
            });
            break;
        case "up":
            viztv.control.navigate.up().then((value) => {
                okToNavigate = true;
            });
            break;
        case "down":
            viztv.control.navigate.down().then((value) => {
                okToNavigate = true;
            });
            break;
        case "ok":
            viztv.control.navigate.ok().then((value) => {
                okToNavigate = true;
            });
            break;
        default:
            viztv.control.navigate.multi(direction).then((value) => {
                okToNavigate = true;
            });
            break;
    }
}

function press1(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);    
}

function press2(viztv) { 
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);       
}

function press3(viztv) { 
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);
}


function press4(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);    
}

function press5(viztv) {
    navigate(viztv, "ok");  
}

function press6(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);      
}

function press7(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);

    //navigate(viztv, "left");  
    //navigate(viztv, "down");  
    //navigate(viztv, "ok");  
    //navigate(viztv, "right");
    //navigate(viztv, "up");
}

function press8(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);
}

function press9(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);
}

function press0(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);
}

function pressDash(viztv) {
    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 1,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);

    var data = {"KEYLIST": [{"CODESET": 3,"CODE": 0,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 2,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 7,"ACTION":"KEYPRESS"}
        , {"CODESET": 3,"CODE": 8,"ACTION":"KEYPRESS"}]};
    navigate(viztv, data);

    //navigate(viztv, "left");
    //navigate(viztv, "down");
    //navigate(viztv, "down");
    //navigate(viztv, "ok");
    //navigate(viztv, "right");
    //navigate(viztv, "up");
    navigate(viztv, "up");
}


function pressEnter(viztv) {
    navigate(viztv, "down");
    navigate(viztv, "down");
    navigate(viztv, "down");
    navigate(viztv, "ok");
}

function okToChangeChannel(tvIPAddr, mfg, key, newChannelID) {
    //console.log("okToChangeChannel tvIPAddr=" + tvIPAddr + " changingChannel=" + changingChannel);
    if (changingChannel) {
        setTimeout(okToChangeChannel, 1000, tvIPAddr, mfg, key, newChannelID);
        return;
    }
    changeTVChannel(tvIPAddr, mfg, key, newChannelID);
}

function changeChannels(tvNumsToChange, newChannelID) {
    var tv;   
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        if (tvNumsToChange.includes(tv.tvNumber)) {
            //console.log("ok to change " + tv.ipAddress + " mfg=" + tv.mfg);
            okToChangeChannel(tv.ipAddress, tv.mfg, tv.key, newChannelID);         
        }
    }  
}

module.exports = { changeChannels }