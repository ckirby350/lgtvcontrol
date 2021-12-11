function showChannels(tvNum) {   
    if (tvNum == "0") {
        var r = confirm("I'm going to turn off all of the TVs!");
        if (r != true) {
            return;
        } 
    }
    document.getElementById("topBtnDiv").style.visibility = "hidden";    
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
            var btnNameStr = "";
            var localTV;
            for (var i = 0; i < localChunkedTVList.length; i++) { 
                for (var cl = 0; cl < localChunkedTVList[i].tvChunk; cl++) {
                    localTV = localChunkedTVList[i].tvChunk[cl];
                    if (tv.tvNumber == "EMPTY") {
                        continue;
                    }
                    btnNameStr = "tv" + tv.tvNumber + "Btn";
                    document.getElementById(btnNameStr).className = "btn btn-primary btn-lg";
                }
            }
            if (data.badTVList && data.badTVList.length > 0 && data.badTVList[0] != "") {
                var badListStr = "";                
                for (var i = 0; i < data.badTVList.length; i++) { 
                    if (i > 0) {
                        badListStr = badListStr + ", ";
                    }
                    badListStr = badListStr + data.badTVList[i];
                    btnNameStr = "tv" + data.badTVList[i] + "Btn";                    
                    document.getElementById(btnNameStr).className = "btn btn-warning btn-lg";
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