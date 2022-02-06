var urlFld = document.querySelector("#url");
var method = document.querySelector("#method");
var reqheaders = document.querySelector("#reqheaders");
var reqbody = document.querySelector("#reqbody");
var respheaders = document.querySelector("#respheaders");
var respbody = document.querySelector("#respbody");
var sendBtn = document.querySelector("#sendBtn");
var err = document.querySelector("#err");
var success = document.querySelector("#success");
err.style.display = "none";
success.style.display = "none";
function showError(e) {
    err.style.display = "block";
    err.value = e;
    setTimeout(function(){
        err.style.display = "none";
    },5000);
}
function showSuccess() {
    success.style.display = "block";
    setTimeout(function(){
        success.style.display = "none";
    },3000);
}
function sendRequestWrapper() {
    err.style.display = "none";
    success.style.display = "none";
    respheaders.value = "";
    respbody.value = "";
    try {
        sendRequest();
    } catch (e) {
        console.log("-->" + e);
        showError(e);
    }
}
function sendRequest() {
    var requestBodyContent = String(reqbody.value).trim();
    console.log("sending " + requestBodyContent);
    var type = "plain";
    if (requestBodyContent.indexOf("{") == 0) {
        requestBodyContent = JSON.stringify(JSON.parse(requestBodyContent));
        type = "json";
    } else if (requestBodyContent.indexOf("<") == 0) {
        type = "xml";
    }
    console.log(`type: ${type}`);

    var headersObj = {};

    if (reqheaders.value != "") {
        var tmpHdr = String(reqheaders.value).split("\n");
        for (var i = 0; i < tmpHdr.length; i++) {
            var h = tmpHdr[i];
            var hs = h.split(":");
            if (hs.length == 2) {
                headersObj[hs[0].trim()] = hs[1].trim();
            }
        }
    }
    headersObj["Access-Control-Allow-Headers"] = "x-requested-with";

    let params = {
        url: urlFld.value,
        type: method.value,
        headers: headersObj,
        crossDomain: true,
        success: function (data, status, xhr) {
            console.info(data);
            respbody.value = JSON.stringify(data);
            respheaders.value = xhr.getAllResponseHeaders();
            if(status=="success") {
                showSuccess();
            }
        },
        error: function (data) {
            console.log(data);
            respbody.value = "ERROR.... " + JSON.stringify(data);
            showError("ERROR.... " + JSON.stringify(data));
        }
    };
    if (requestBodyContent != "") {
        params["dataType"] = type;
        if (type == "json") {
            headersObj["Content-Type"] = "application/json; charset=utf-8";
        } else if (type == "xml") {
            headersObj["Content-Type"] = "application/xml; charset=utf-8";
        }
        params["data"] = requestBodyContent;
    }
    console.log("Headers: " + JSON.stringify(headersObj));
    console.log(JSON.stringify(params));
    $.ajax(params);
}

sendBtn.addEventListener("click", sendRequestWrapper);