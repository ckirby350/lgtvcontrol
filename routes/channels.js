require('../vars.js');
var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
    console.log("in channels router about to render page...");
    res.render('channels', { selectedTV : "", tvList : tvListObj, selectedTVList : [], 
        channelList : staticChannelList, currentChannelID : '', currentChannelNumber : '' });

});
module.exports = router;