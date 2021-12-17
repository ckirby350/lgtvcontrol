require('./vars.js');
var changingChannel = false;
var okToNavigate = true;
var viziotv;

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
        viziotv = new smartcast(tvIPAddr, key);
        goToVizioChannel(newChannelID);
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
        ***/
    } 
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
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
            sleep(900);  
            viziotv.control.keyCommand(0, code2, 'KEYPRESS').then((value) => { 
                if (code3 > 0) {
                    sleep(900); 
                    changingChannel = false;
                    viziotv.control.keyCommand(0, code3, 'KEYPRESS').then((value) => { 
                        if (code4 > 0) {
                            sleep(900); 
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
    console.log("okToChangeChannel tvIPAddr=" + tvIPAddr + " changingChannel=" + changingChannel);
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