let smartcast = require('./vizio');
//var channelList;
//var currentChannelNum = "";
var tvIP = "192.168.254.77";
//let tv = new smartcast(tvIP);
var tv = new smartcast(tvIP,'Zqcxkfnf6l');

tvList = [];

const ch = require("./channelhandler");

tvList.push("5");

//ch.changeChannels(tvList, "47-1");

/***
function changeTVChannel(tvIPAddr, key, newChannelID) {
  var tv = new smartcast(tvIP,'Zqcxkfnf6l');
}
***/
var okToChangeChannelAgain = true;
var codeList = [52, 55, 45, 49];
var currSpot = 0;

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function goToChannel(channelNum) {
  console.log("sending ch up...");
  //tv.control.keyCommand(8, 1, 'KEYPRESS').then((value) => {
  tv.control.channel.up().then((value) => {
    console.log("back from ch up");
    console.log(JSON.stringify(value));
    sleep(100); 
    console.log("getcurrchannel...");
    tv.settings.channels.get().then((data) => {
      console.log("back from getcurrchannel");
      //console.log(data);
      channelList = data;
      for (var i=0; i < channelList.ITEMS.length; i++) {
        if (channelList.ITEMS[i].CNAME == "current_channel") {
          currentChannelNum = channelList.ITEMS[i].VALUE;
          break;
        } 
      }
      console.log("currentChannelNum=" + currentChannelNum);
      if (currentChannelNum != channelNum) {
        goToChannel(channelNum);
      }
    });
  });
}

goToChannel("47-1");

/*** 
sleep(2000);
console.log("sending 7...");
tv.control.keyCommand(0, 55, 'KEYPRESS').then((value) => {
  console.log("back from 7");
  console.log(JSON.stringify(value));
});
sleep(2000);
console.log("sending -...");
tv.control.keyCommand(0, 45, 'KEYPRESS').then((value) => {
  console.log("back from -");
  console.log(JSON.stringify(value));
});
sleep(2000);
console.log("sending 1...");
tv.control.keyCommand(0, 49, 'KEYPRESS');
***/

/***
function sendChannel() {
  if (!okToChangeChannelAgain) {
    setTimeout(sendChannel, 1000);
  }
  okToChangeChannelAgain = false;
  var codeset = 0;
  var code = codeList[currSpot];
  console.log("sending " + code + "...");
  tv.control.keyCommand(codeset, code, 'KEYPRESS').then((value) => {
    currSpot++;
    okToChangeChannelAgain = true;
    if (currSpot >= codeList.length) {
      return;
    }
    sendChannel();
  });
  return;
}
***/

//sendChannel();

//tv.control.keyCommand(0, 52, 'KEYPRESS');
//tv.control.keyCommand(0, 55, 'KEYPRESS');
//tv.control.keyCommand(0, 45, 'KEYPRESS');
//tv.control.keyCommand(0, 49, 'KEYPRESS');
//tv.control.navigate.ok().then((value) => {
//  okToNavigate = true;
//});

/***
tv.settings.channels.get().then((data) => {
  console.log(data);
  channelList = data;
  for (var i=0; i < channelList.ITEMS.length; i++) {
    if (channelList.ITEMS[i].CNAME == "current_channel") {
      currentChannelNum = channelList.ITEMS[i].VALUE;
      break;
    } 
  }
  console.log("currentChannelNum=" + currentChannelNum);
  okToChangeChannelAgain = true;
});
***/

/***

tv.control.channel.down((value) => {
  console.log("downed it! value=" + JSON.stringify(value));  
});

tv.settings.channels.get().then((data) => {
  console.log(data);
  channelList = data;
  for (var i=0; i < channelList.ITEMS.length; i++) {
    if (channelList.ITEMS[i].CNAME == "current_channel") {
      currentChannelNum = channelList.ITEMS[i].VALUE;
      break;
    } 
  }
  console.log("currentChannelNum=" + currentChannelNum);
  okToChangeChannelAgain = true;
});
***/

/***
function channelDownOne() {
  if (!okToChangeChannelAgain) {
    setTimeout(channelDownOne(), 1000);
  }
  okToChangeChannelAgain = false;
  tv.control.channel.down((value) => {
    //console.log("downed it! value=" + JSON.stringify(value));
    tv.settings.channels.get().then((data) => {
      //console.log(data);
      channelList = data;
      for (var i=0; i < channelList.ITEMS.length; i++) {
        if (channelList.ITEMS[i].CNAME == "current_channel") {
          currentChannelNum = channelList.ITEMS[i].VALUE;
          break;
        } 
      }
      console.log("currentChannelNum=" + currentChannelNum);
      okToChangeChannelAgain = true;
    });
  });
}
***/

//channelDownOne();

/***
while (currentChannelNum != "47-3") {
  if (okToChangeChannelAgain) {
    channelDownOne();
  }

}
***/

/*****
 downPromise = tv.control.channel.down();

  downPromise.then((value) => {
      //console.log("downed it! value=" + JSON.stringify(value));
      tv.settings.channels.get().then((data) => {
        //console.log(data);
        channelList = data;
        for (var i=0; i < channelList.ITEMS.length; i++) {
          if (channelList.ITEMS[i].CNAME == "current_channel") {
            currentChannelNum = channelList.ITEMS[i].VALUE;
            break;
          } 
        }
        console.log("currentChannelNum=" + currentChannelNum);
      });
    }
  );

 */

/***
  tv.settings.channels.get().then((data) => {
    console.log(data);
    channelList = data;
    for (var i=0; i < channelList.ITEMS.length; i++) {
      if (channelList.ITEMS[i].CNAME == "current_channel") {
        currentChannelNum = channelList.ITEMS[i].VALUE;
        break;
      } 
    }
    console.log("currentChannelNum=" + currentChannelNum);
  });
  ***/


//tv.settings.channels.get().then(data => console.log(data));

//tv.settings.devices.get().then(data => console.log(data));

//tv.settings.system.get().then(data => console.log(data));

//tv.settings.system.information.get().then(data => console.log(data));

//tv.settings.system.information.tv.get().then(data => console.log(data));

//tv.settings.system.information.tuner.get().then(data => console.log(data));

//tv.settings.system.information.uli.get().then(data => console.log(data));

//tv.settings.cast.get().then(data => console.log(data));


/***
tv.input.list().then(data => {
  console.log('response: ', data);
});
****/

/***
tv.power.currentMode().then(data => {
  console.log(data);
});

smartcast.discover(device => {
  console.log(device);
});
***/

/***
tv.pairing.useAuthToken('Zqcxkfnf6l');

// make a call to an authenticated method
tv.input.current().then(data => {
  console.log('response: ', data);
});
****/



