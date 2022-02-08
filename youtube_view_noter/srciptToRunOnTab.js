var counter = document.querySelector(".style-scope ytd-video-view-count-renderer span");
if (counter != undefined) {
    var data = localStorage.getItem("youtube_view_noter");
    if (data == null || data == undefined) {
        data = {};
    } else {
       data = JSON.parse(data);
    }
    if (data == null || data == undefined) {
        data = {};
        data[window.location.href] = ["[" + (new Date()) + ": " + counter.innerText + "]"];
    } else if (data[window.location.href] == undefined) {
        data[window.location.href] = ["[" + (new Date()) + ": " + counter.innerText + "]"];
    } else {
        var lastElem = data[window.location.href][data[window.location.href].length-1];
        if(lastElem.indexOf(counter.innerText + "]")==-1) {//if the viewcount is not noted
            data[window.location.href].push("[" + (new Date()) + ": " + counter.innerText + "]");
        }
    }
    localStorage.setItem("youtube_view_noter", JSON.stringify(data));
    chrome.runtime.sendMessage({ cntr: data }, function (response) {
        console.log(response.farewell);
    });
}