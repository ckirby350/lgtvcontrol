let smartcast = require('./vizio');
var channelList;
var currentChannelNum = "";
var tvIP = "192.168.254.77";
let tv = new smartcast(tvIP);

let readline = require('readline'); // user input via cmd line

// configure cmd line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initiate a pairing request with a smartcast device
tv.pairing.initiate().then(response => {
  // prompt the user for the pin that is displayed on the smartcast device
  rl.question('Enter PIN:', answer => {
    // send the pin to the smartcast device to complete the pairing process
    tv.pairing.pair(answer).then(response => {
      // log the token to be used for future, authenticated requests
		var authTok = response.ITEM.AUTH_TOKEN;
		console.log("Here's your key: " + authTok);
		tv = new smartcast(tvIP,authTok);
		tv.settings.channels.get().then(data => console.log(data));
		tv.settings.system.information.tuner.get().then(data => console.log(data));

    });

    rl.close();
  });
});

/***
function changeTVChannel(tvIPAddr, key, newChannelID) {
  var tv = new smartcast(tvIP,'Zqcxkfnf6l');
}
***/

//tv.control.keyCommand(0, 4, 'KEYPRESS');

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
var okToChangeChannelAgain = true;

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



