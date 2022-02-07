var counter = document.querySelector(".style-scope ytd-video-view-count-renderer span");
if (counter != undefined) {
    var data = localStorage.getItem("youtube_view_noter");
    if (data == null || data == undefined) {
        data = {};
    } else {
       data = JSON.parse(data);
    }
    if (data[window.location.href] == undefined) {
        data[window.location.href] = ["[" + (new Date()) + ": " + counter.innerText + "]"];
    } else {
        data[window.location.href].push("[" + (new Date()) + ": " + counter.innerText + "]");
    }
    localStorage.setItem("youtube_view_noter", JSON.stringify(data));
    chrome.runtime.sendMessage({ cntr: data }, function (response) {
        console.log(response.farewell);
    });
}