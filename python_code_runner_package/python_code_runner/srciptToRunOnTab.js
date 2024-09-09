var html = document.querySelectorAll("code.language-python");
if(sessionStorage.getItem("newSelector")) {
    html = document.querySelectorAll(sessionStorage.getItem("newSelector"));
}
if (html != undefined && html.length>0) {
    let htmlArr = [];
    for(let i=0;i<html.length;i++) {
        htmlArr.push(html[i].innerText);
    }
    chrome.runtime.sendMessage({ code: htmlArr }, function (response) {
        console.log(response.farewell);
    });
}