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
    if (!selectedTVNums || selectedTVNums.length < 1 || selectedTVNums[0] == "") {
        window.alert("No TV selected to show this channel. Select at least 1 TV from the right button list.");
        return;
    }  
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("channelID").value = channelID;
    document.getElementById("tvNumsFld").value = selectedTVNums;    
    document.forms[0].submit();
}

function deleteTableRow(rowid) {   
    var row = document.getElementById(rowid);
    row.parentNode.removeChild(row);
}

function deleteScript(btn, scriptID) {
    btn.disabled = true;
    //window.alert("going to delete: " + scriptID);
    deleteTableRow(scriptID);
    $.ajax({
        "url": "/scripts/delete/" + scriptID,
        "method": "GET"
      })
      .done(function(data) {
            //don't care
      });
    
    
}