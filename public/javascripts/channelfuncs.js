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

function selectChannel(channelID) {    
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("channelID").value = channelID;
    document.getElementById("tvNumsFld").value = selectedTVNums;    
    document.forms[0].submit();
}