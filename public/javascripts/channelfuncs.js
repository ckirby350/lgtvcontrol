function selectChannel(channelID) {    
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("channelID").value = channelID;
    document.forms[0].submit();
}