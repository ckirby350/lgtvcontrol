var scriptSelectedTVNums = [];
var fetchingChannels = false;
var tvChannelsWereRetrieved = false;
var selectedChannelID;

function initPage(tvList, channelID) {
    selectedChannelID = channelID;
    if (tvList && tvList != "undefined" && tvList != "") {
        tvNumArray = tvList.split(",");
        firstBtn = document.getElementById("tvBtn" + tvNumArray[0]);
        firstBtn.className = "btn btn-primary btn-lg";
        selectTV(firstBtn, tvNumArray[0]);
        for (var i=1; i < tvNumArray.length; i++) {
            scriptSelectedTVNums[scriptSelectedTVNums.length] = tvNumArray[i];
        }
    }
}

function saveScript() {
    if (scriptSelectedTVNums.length < 1 || document.getElementById("selectedChannelID").value.length < 1) {
        window.alert("You have to pick at least 1 TV and 1 Channel for the script.")
        return;
    }
    document.getElementById("mainBtnDiv").style.visibility = "hidden";
    var tvStr = "";
    for (var i=0; i < scriptSelectedTVNums.length; i++) {
        if (i > 0) {
            tvStr = tvStr + ",";
        }
        tvStr = tvStr + scriptSelectedTVNums[i];
    }
    document.getElementById("selectedTVNums").value = tvStr;
    //window.alert("selectedTVNums len=" + scriptSelectedTVNums.length + " selectedChannelIDs len=" + scriptSelectedChannelIDs.length);
    document.getElementById("scriptForm").submit();
}

function selectChannel(btn, xchannelID) {
    //window.alert("selected channelID=" + xchannelID + " btn.id=" + btn.id + " type=" + btn.type + " tagName=" + btn.tagName);
    var ybtn;
    var ybuttons = document.getElementsByTagName('input');
    for (let i = 0; i < ybuttons.length; i++) {
        ybtn = ybuttons[i];
        if (ybtn.id.indexOf("channelBtn") > -1) {
            ybtn.className = "btn btn-primary btn-lg";
        }        
    }
    btn.className = "btn btn-success btn-lg";
    document.getElementById("selectedChannelID").value = xchannelID;
}


function selectTV(btn, tvnum) {
    /***
    window.alert("btn.className.indexOf(primary)=" + btn.className.indexOf("primary") 
    + " scriptSelectedTVNums len=" + scriptSelectedTVNums.length 
    + " type=" + btn.type + " tagName=" + btn.tagName);
    ***/
    if (btn.className.indexOf("primary") > -1) {
        btn.className = "btn btn-success btn-lg";
        scriptSelectedTVNums[scriptSelectedTVNums.length] = tvnum;
    } else {
        btn.className = "btn btn-primary btn-lg";
        var tvnumSpot = scriptSelectedTVNums.indexOf(tvnum);
        if (tvnumSpot > -1) {
            scriptSelectedTVNums.splice(tvnumSpot, 1);
        }
        if (scriptSelectedTVNums.length < 1) {
            var xbtn;
            var objectsToRemove = [];
            tvChannelsWereRetrieved = false;
            var buttons = document.getElementsByTagName('input');
            for (var i = 0; i < buttons.length; i++) {
                xbtn = buttons[i]; 
                if (xbtn && xbtn != "undefined" && (xbtn.id.indexOf("channelBtn") > -1)) {
                    objectsToRemove.push(xbtn);                    
                }
            }
            for (var i = 0; i < objectsToRemove.length; i++) { 
                xbtn = objectsToRemove[i];
                xbtn.remove();
            }
            return;
        }
    }
    //window.alert("selectedTVNums len=" + selectedTVNums.length + " tvChannelsWereRetrieved=" + tvChannelsWereRetrieved);
    if (!tvChannelsWereRetrieved && !fetchingChannels) {
        fetchingChannels = true;
        $.ajax({
            "url": "/scripts/getChannels/" + tvnum,
            "method": "GET"
          })
          .done(function(data) {
                tvChannelsWereRetrieved = true;
                fetchingChannels = false;
                //window.alert("returned from getChannels ajax call!! data.scriptAvailChannelList.length=" + data.scriptAvailChannelList.length);                
                var xchannel;
                var channelBtn;
                var channelDiv = document.getElementById("channelDiv");
                for (var i = 0; i < data.scriptAvailChannelList.length; i++) {
                    xchannel = data.scriptAvailChannelList[i];
                    channelBtn = document.createElement("input");
                    channelBtn.type = "button";
                    channelBtn.id = "channelBtn" + xchannel.channelId;
                    channelBtn.innerHTML = xchannel.channelMode + " " + xchannel.channelNumber;
                    channelBtn.value = xchannel.channelMode + " " + xchannel.channelNumber;
                    channelBtn.className = 'btn btn-primary btn-lg';
                    channelBtn.style.marginBottom = '30px';
                    channelBtn.style.marginLeft = '30px';
                    channelBtn.setAttribute("onClick", "javascript: selectChannel(this,'" + xchannel.channelId + "');");
                    channelDiv.appendChild(channelBtn);
                }                
                if (selectedChannelID && selectedChannelID != "undefined" && selectedChannelID != "") {
                    selectChannel(document.getElementById("channelBtn" + selectedChannelID), selectedChannelID);
                }
          });
    }

}
