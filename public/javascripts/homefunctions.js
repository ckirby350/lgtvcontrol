function showChannels(tvNum) {   
    document.getElementById("btnDiv").style.visibility = "hidden";
    document.getElementById("selectedTV").value = tvNum;
    document.forms[0].submit();
}