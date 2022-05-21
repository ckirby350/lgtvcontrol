var scriptSelectedTVNums = [];
var fetchingChannels = false;
var tvChannelsWereRetrieved = false;
var catRowCnt = 1000;

function initPage(tvList, channelID, channelNumber) {  
    document.getElementById("selectedChannelID").value = channelID;
    document.getElementById("selectedChannelNumber").value = channelNumber;  
    /***
    if (tvList && tvList != "undefined" && tvList != "") {
        tvNumArray = tvList.split(",");
        firstBtn = document.getElementById("tvBtn" + tvNumArray[0]);
        firstBtn.className = "btn btn-primary btn-lg";
        selectTV(firstBtn, tvNumArray[0]);
        for (var i=1; i < tvNumArray.length; i++) {
            scriptSelectedTVNums[scriptSelectedTVNums.length] = tvNumArray[i];
        }
    }
    ***/
}

function addSelection() {
    if (scriptSelectedTVNums.length < 1 || document.getElementById("selectedChannelID").value.length < 1) {
        window.alert("You have to pick at least 1 TV and 1 Channel for the selection.")
        return;
    }
    var tvStr = "";
    for (var i=0; i < scriptSelectedTVNums.length; i++) {
        if (i > 0) {
            tvStr = tvStr + ",";
        }
        tvStr = tvStr + scriptSelectedTVNums[i];
    }
    catRowCnt++;
    //window.alert("tvs Selected=" + tvStr + " channelID=" + document.getElementById("selectedChannelID").value + " channelNum=" + document.getElementById("selectedChannelNumber").value);    
    var catTbody = document.getElementById('channelAndTVsTbl').getElementsByTagName('tbody')[0];
    var newRow = catTbody.insertRow();
    newRow.id = "catRow" + catRowCnt;
    var newTD = newRow.insertCell();
    newTD.style.padding = "0px";
    newTD.innerHTML = '<a href="javascript:deleteChannelAndTVsTblRow(\'catRow' + catRowCnt + '\');" class="text-danger fw-bold text-decoration-none")>X</a> ' +
        document.getElementById("selectedChannelNumber").value + ' : ' + tvStr;  
    clearChannelBtnSelect();  
    clearTVBtnSelect();
}

function deleteChannelAndTVsTblRow(rowid) {
    var row = document.getElementById(rowid);
    row.parentNode.removeChild(row);
} 

function saveScript() {
    var catBody = document.getElementById('channelAndTVsTbl').getElementsByTagName('tbody')[0];
    var selectionCnt = catBody.rows.length;
    //if (scriptSelectedTVNums.length < 1 || document.getElementById("selectedChannelID").value.length < 1) {
    if (selectionCnt < 1) {
        window.alert("You have to have at least one listing in the Channel/TV Selection list to save the script.")
        return;
    }
    document.getElementById("mainBtnDiv").style.visibility = "hidden";
    var tdVal = "";
    var splitVal = [];
    var endAIndex = -1;
    var selectedChannelNums = "";
    var selectedTVNums = "";
    for (var rowcnt=0; rowcnt < selectionCnt; rowcnt++) {
        tdVal = catBody.rows[rowcnt].cells[0].innerHTML;
        endAIndex = tdVal.indexOf("</a>");
        tdVal = tdVal.substring((endAIndex + 5));
        //window.alert("tdval=" + tdVal);
        splitVal = tdVal.split(":");
        if (selectedChannelNums && selectedChannelNums.length > 0) {
            selectedChannelNums = selectedChannelNums + "|";
            selectedTVNums = selectedTVNums + "|";
        }
        selectedChannelNums = selectedChannelNums + splitVal[0].trim();
        selectedTVNums = selectedTVNums + splitVal[1].trim() ;
        //window.alert("channelNum=" + splitVal[0].trim() + " tvs=" + splitVal[1].trim()  );
    }
    document.getElementById("selectedTVNums").value = selectedTVNums;
    document.getElementById("selectedChannelNumber").value = selectedChannelNums;
    //window.alert("selectedChannelNumber=" + document.getElementById("selectedChannelNumber").value + " selectedTVNums=" + document.getElementById("selectedTVNums").value  );
    document.getElementById("scriptForm").submit();
}

function clearChannelBtnSelect() {    
    ybuttons = document.getElementsByTagName('button');
    //window.alert("ybuttons len=" + ybuttons.length);
    for (let i = 0; i < ybuttons.length; i++) {
        ybtn = ybuttons[i];
        //window.alert("ybtn id=" + ybtn.id);
        if (ybtn.id.indexOf("channelBtn") > -1) {
            ybtn.className = "btn btn-primary btn-lg";
        }        
    }
    document.getElementById("selectedChannelID").value = "";
    document.getElementById("selectedChannelNumber").value = "";
}

function clearTVBtnSelect() {    
    ybuttons = document.getElementsByTagName('button');
    //window.alert("ybuttons len=" + ybuttons.length);
    for (let i = 0; i < ybuttons.length; i++) {
        ybtn = ybuttons[i];
        //window.alert("ybtn id=" + ybtn.id);
        if (ybtn.id.indexOf("tvBtn") > -1) {
            ybtn.className = "btn btn-primary btn-lg";
        }        
    }
    scriptSelectedTVNums.splice(0, scriptSelectedTVNums.length);
}

function selectChannel(btn, xchannelID, xchannelNum) {
    //window.alert("selected channelID=" + xchannelID + " btn.id=" + btn.id + " type=" + btn.type + " tagName=" + btn.tagName);
    clearChannelBtnSelect();
    btn.className = "btn btn-success btn-lg";
    document.getElementById("selectedChannelID").value = xchannelID;
    document.getElementById("selectedChannelNumber").value = xchannelNum;
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
        /***
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
        ***/
    }
    //window.alert("selectedTVNums len=" + selectedTVNums.length + " tvChannelsWereRetrieved=" + tvChannelsWereRetrieved);
    /******* used to fetch channels based on TV selected, now just static list from vars
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
    ***/

}
