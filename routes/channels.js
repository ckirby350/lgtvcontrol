var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
    console.log("in channels router about to render page...");
    res.render('channels', { channelList : "test" });
});
module.exports = router;