function showChannels(tvNum) {   
    if (tvNum == "0") {
        var r = confirm("I'm going to turn off all of the TVs!");
        if (r != true) {
            return;
        } 
    }
    document.getElementById("powerOffBtn").style.visibility = "hidden";
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("selectedTV").value = tvNum;
    document.forms[0].submit();
}

