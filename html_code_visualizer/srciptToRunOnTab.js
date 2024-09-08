var html = document.querySelectorAll("code.language-html");
if(sessionStorage.getItem("newSelector")) {
    html = document.querySelectorAll(sessionStorage.getItem("newSelector"));
}
if (html != undefined && html.length>0) {
    let htmlArr = [];
    for(let i=0;i<html.length;i++) {
        htmlArr.push(html[i].innerText);
        if(!sessionStorage.getItem("experimentalFeature")) {
            sessionStorage.setItem("experimentalFeature","false");
        } else if(sessionStorage.getItem("experimentalFeature") == "true"){
            html[i].innerHTML = html[i].innerText;
        }
    }
    chrome.runtime.sendMessage({ code: htmlArr }, function (response) {
        console.log(response.farewell);
    });
}