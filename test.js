const prompt = require('prompt-sync')({sigint: true});
var tvList = ['192.168.254.23','192.168.254.23','192.168.254.23','192.168.254.11']
var selectedTVNum = 0;

var lgtv = require('./index.js')({
	url: 'ws://' + tvList[0] + ':3000'
    //url: 'ws://lgwebostv:3000'
});

lgtv.on('error', function (err) {
    console.log(err);
});

lgtv.on('connecting', function () {
    console.log('connecting...');
});

lgtv.on('connect', function () {
    console.log('connected to TV# ' + selectedTVNum);
	
	lgtv.subscribe('ssap://tv/getChannelList', function (err, res) {
        //console.log('channels', res);
		//resj = JSON.parse(res);
		lgtv.currentChannelList = res;
		//console.log(lgtv.currentChannelList.channelList.length);
		console.log("Channel List:");
		for (var chCnt=0; chCnt < res.channelList.length; chCnt++) {
			console.log(' (' + chCnt + ') ' + res.channelList[chCnt].channelMode + ' ' + res.channelList[chCnt].channelNumber + ' id=' + res.channelList[chCnt].channelId);
		}
		console.log(' (X) Close and connect to another TV');
    });
	
	lgtv.subscribe('ssap://tv/getCurrentChannel', function (err, res) {
		console.log("Current Channel: " + res.channelModeName + ' ' + res.channelNumber + ' id=' + res.channelId);
		
		let selectedChannel = prompt('Select channel: ');
		if (selectedChannel == "X" || selectedChannel == "x") {
			lgtv.disconnect();			
			//process.exit(1);
		}
	
		selectedChannelNum = Number(selectedChannel);
		if (selectedChannelNum >=0 && selectedChannelNum < lgtv.currentChannelList.channelList.length) {
			lgtv.request('ssap://tv/openChannel', {channelId: lgtv.currentChannelList.channelList[selectedChannelNum].channelId});
		}
    });
	
	

	//lgtv.request('ssap://tv/openChannel', {channelId: '3_3_3_1_0_0_0'});
	
	/**
	lgtv.subscribe('ssap://tv/getExternalInputList', function (err, res) {
        console.log('inputs', res);
    });
	***/

	/***
    lgtv.subscribe('ssap://audio/getVolume', function (err, res) {
        if (res.changed && res.changed.indexOf('volume') !== -1) console.log('volume changed', res.volume);
        if (res.changed && res.changed.indexOf('muted') !== -1) console.log('mute changed', res.muted);
    });

    lgtv.subscribe('ssap://com.webos.applicationManager/getForegroundAppInfo', function (err, res) {
        console.log('app', res.appId);
    });
	***/
});


lgtv.on('prompt', function () {
    console.log('please authorize on TV');
});

lgtv.on('close', function () {
    console.log('close');
	console.log("TV List:");
	for (var tvCnt=0; tvCnt < tvList.length; tvCnt++) {
		console.log(' (' + tvCnt + ') ' + tvList[tvCnt]);
	}
	let selectedTV = prompt('Select TV: ');
	selectedTVNum = Number(selectedTV);
	if (selectedTVNum >=0 && selectedTVNum < tvList.length) {
		lgtv.currentTV = selectedTVNum;
		lgtv.connect('ws://' + tvList[selectedTVNum] + ':3000');
	}
		
});




