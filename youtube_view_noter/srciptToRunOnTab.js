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
        var lastElem = data[window.location.href][data[window.location.href].length - 1];
        var lastElemCount = parseInt(String(lastElem.split("):")[1]).split(",").join(""));
        if(isNaN(lastElemCount)) {
            lastElemCount = 0;
        }
        //console.log(`Analyzing view count: ${counter.innerText}`);
        if (lastElem.indexOf(counter.innerText + "]") == -1) {//if the viewcount is not noted
            var currentElemCount = parseInt(String(counter.innerText).split(",").join(""));
            if (currentElemCount > lastElemCount) {
                data[window.location.href].push("[" + (new Date()) + ": " + counter.innerText + "]");
                //noted = true;
            } else {
                console.log(`Ignored! View count in this tab: ${currentElemCount} is less than previousy noted ${lastElemCount}`);
            }
        }
    }
    localStorage.setItem("youtube_view_noter", JSON.stringify(data));
    chrome.runtime.sendMessage({ cntr: data }, function (response) {
        console.log(response.farewell);
    });
}