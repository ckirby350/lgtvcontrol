var selectedTVNums = [];

function selectTV(btn, tvnum) {
    if (btn.className.indexOf("primary") > -1) {
        btn.className = "btn btn-success btn-lg";
        selectedTVNums[selectedTVNums.length] = tvnum;
    } else {
        btn.className = "btn btn-primary btn-lg";
        var tvnumSpot = selectedTVNums.indexOf(tvnum);
        if (tvnumSpot > -1) {
            selectedTVNums.splice(tvnumSpot, 1);
        }
    }

}

function selectChannel(channelID, channelNum) {  
    if (!selectedTVNums || selectedTVNums.length < 1 || selectedTVNums[0] == "") {
        window.alert("No TV selected to show this channel. Select at least 1 TV from the TV button list.");
        return;
    }  
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("channelID").value = channelID;
    document.getElementById("channelNumber").value = channelNum;
    document.getElementById("tvNumsFld").value = selectedTVNums;    
    document.getElementById("changeChannelForm").submit();
}