function showChannels(tvNum) {   
    if (tvNum == "0") {
        var r = confirm("I'm going to turn off all of the TVs!");
        if (r != true) {
            return;
        } 
    }
    document.getElementById("healthChkBtn").style.visibility = "hidden";
    document.getElementById("powerOffBtn").style.visibility = "hidden";
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("selectedTV").value = tvNum;
    document.forms[0].submit();
}

function runHealthCheck() {
    document.getElementById("healthChkBtn").disabled = true;
    document.getElementById("healthChkBtn").innerHTML = "Running...";
    $.ajax({
        "url": "/healthCheck",
        "method": "GET"
      })
      .done(function(data) {
            if (data.badTVList && data.badTVList.length > 0 && data.badTVList[0] != "") {
                var badListStr = "";
                for (var i = 0; i < data.badTVList.length; i++) { 
                    if (i > 0) {
                        badListStr = badListStr + ", ";
                    }
                    badListStr = badListStr + data.badTVList[i];
                }
                window.alert("Could not connect to " + data.badTVList.length + " TVs:\n" + badListStr);
            } else {
                window.alert("No problems found.");
            }
            //window.alert("ajax returned: " + data.badTVList[0]);
            document.getElementById("healthChkBtn").innerHTML = "Health Check";
            document.getElementById("healthChkBtn").disabled = false;
      });
}