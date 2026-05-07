document.getElementById("sample").onchange = function(evt) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
            document.getElementById("textpad").innerHTML = request.responseText;
        }
    };

    var param = "ajax_textpad=" + this.value;
    request.open("POST", 'index.php', true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", param.length);
    request.setRequestHeader("Connection", "close");
    request.send(param);
}
