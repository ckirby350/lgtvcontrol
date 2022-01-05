require('./vars.js');
const strf = require("./strfuncts.js");
var changingChannel = false;
var okToNavigate = true;
var viziotv;


function okToChangeChannel(tvIPAddr, mfg, key, newChannelID, newChannelNumber) {
    //console.log("okToChangeChannel tvIPAddr=" + tvIPAddr + " changingChannel=" + changingChannel);
    if (changingChannel) {
        setTimeout(okToChangeChannel, 1000, tvIPAddr, mfg, key, newChannelID, newChannelNumber);
        return;
    }
    changeTVChannel(tvIPAddr, mfg, key, newChannelID, newChannelNumber);
}

function changeChannels(tvNumsToChange, newChannelID, newChannelNumber) {
    var tv;   
    for (var i = 0; i < tvListObj.length; i++) { 
        tv = tvListObj[i];
        if (tvNumsToChange.includes(tv.tvNumber)) {
            console.log("ok to change " + tv.ipAddress + " mfg=" + tv.mfg);
            okToChangeChannel(tv.ipAddress, tv.mfg, tv.key, newChannelID, newChannelNumber);         
        }
    }  
}

function changeTVChannel(tvIPAddr, mfg, key, newChannelID, newChannelNumber) {
    changingChannel = true;
    var xlgtv;
    console.log("Changing TV IP " + tvIPAddr + " mfg=" + mfg + " to channel id=" + newChannelID + " num=" + newChannelNumber);
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
        viziotv = new smartcast(tvIPAddr, key);
        goToVizioChannel(newChannelNumber);        
    } 
    if (mfg == "SONY") {
        goToSonyChannel(tvIPAddr, key, newChannelNumber);
    }
    if (mfg == "SAMSUNG") {
        goToSamsungChannel(tvIPAddr, key, newChannelNumber);
    }
}

function goToSamsungChannel(tvIPAddr, key, channelNum) {
    SamsungTv = require('./samsunglib/SamsungTv');
    deviceConfig = {
        ip: tvIPAddr,
        appId: samsungAppId,
        userId: samsungUserId,
      }
    //console.log(deviceConfig);
    samtv = new SamsungTv(deviceConfig);
    samtv.init()
        .then(() => samtv.confirmPin(key))
        .then(() => samtv.connect())
        .then(() => {
            samtv.sendKey('KEY_' + channelNum.substring(0,1));
            if (channelNum.length > 1) {
                strf.sleep(900);
                samtv.sendKey('KEY_' + channelNum.substring(1,2));
            }
        })
        .then(() => {
            samtv.connection.socket.close();
            changingChannel = false;
        }).catch(err => { 
            changingChannel = false;
        });
}

function goToSonyChannel(tvIPAddr, key, channelNum) {
    var code1 = 0;
    var code2 = 0;
    var bravia = require('./bravialib/sonytv');
    //console.log("goToSonyChannel 1");
    bravia(tvIPAddr, key, function(client) {
        //console.log("goToSonyChannel 2 for " + "Num" + channelNum.substring(0,1));
        client.getCommandCode(("Num" + channelNum.substring(0,1)), function(code) {
            //console.log("Code for " + "Num" + channelNum.substring(0,1) + "=" + code);
            //sleep(900);  
            client.makeCommandRequest(code, function(resp) {
                //console.log("back from first number call resp=" + resp);
                if (channelNum.length > 1 && channelNum.substring(1,2) != "-") {
                    //sleep(900);  
                    client.getCommandCode(("Num" + channelNum.substring(1,2)), function(xcode) {
                        //console.log("Code for " + "Num" + channelNum.substring(1,2) + "=" + xcode);
                        //sleep(900);  
                        client.makeCommandRequest(xcode);
                        changingChannel = false;
                    });
                } else {
                    changingChannel = false;
                }
            });
        });
    });
}


function goToVizioChannel(channelNum) {
    var code1 = 0;
    var code2 = 0;
    var code3 = 0;
    var code4 = 0;
    code1 = 48 + Number(channelNum.substring(0,1));
    if (channelNum.length > 1) {
        if (channelNum.substring(1,2) == "-") {
            code2 = 45;
        } else {
            code2 = 48 + Number(channelNum.substring(1,2));
        }
    }
    if (channelNum.length > 2) {
        if (channelNum.substring(2,3) == "-") {
            code3 = 45;
        } else {
            code3 = 48 + Number(channelNum.substring(2,3));
        }
    }
    if (channelNum.length > 3) {
        if (channelNum.substring(3,4) == "-") {
            code4 = 45;
        } else {
            code4 = 48 + Number(channelNum.substring(3,4));
        }
    }
    viziotv.control.keyCommand(0, code1, 'KEYPRESS').then((value) => {
        if (code2 > 0) {
            strf.sleep(900);  
            viziotv.control.keyCommand(0, code2, 'KEYPRESS').then((value) => { 
                if (code3 > 0) {
                    strf.sleep(900); 
                    changingChannel = false;
                    viziotv.control.keyCommand(0, code3, 'KEYPRESS').then((value) => { 
                        if (code4 > 0) {
                            strf.sleep(900); 
                            viziotv.control.keyCommand(0, code4, 'KEYPRESS');
                        }
                    });
                } else {
                    changingChannel = false;
                }
            });
        } else {
            changingChannel = false;
        }    
    });
}


/*** tried with ch up until I got there - FAIL
function goToVizioChannel(channelNum) {
    //console.log("sending ch up...");    
    viziotv.control.channel.up().then((value) => {
      //console.log("back from ch up");
      //console.log(JSON.stringify(value));
      sleep(400); 
      //console.log("getcurrchannel...");
      viziotv.settings.channels.get().then((data) => {
        //console.log("back from getcurrchannel");
        //console.log(data);
        channelList = data;
        for (var i=0; i < channelList.ITEMS.length; i++) {
          if (channelList.ITEMS[i].CNAME == "current_channel") {
            currentChannelNum = channelList.ITEMS[i].VALUE;
            break;
          } 
        }
        //console.log("currentChannelNum=" + currentChannelNum);
        if (currentChannelNum != channelNum) {
            goToVizioChannel(channelNum);
        }
      });
    });
}
***/

/*** Original key navigation way
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
****************/
    

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


module.exports = { changeChannels }