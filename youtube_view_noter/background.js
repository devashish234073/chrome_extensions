var DELAY = 10000;
console.log("[youtube_view_noter_extension] background will run after timeout.... " + DELAY + " ms");
setInterval(function () {
    if(window.location.href.indexOf("www.youtube.com/watch")==-1) {
        return;
    }
    console.log("[youtube_view_noter_extension] running background script after timeout..."+ DELAY + " ms");
    var counter = document.querySelector(".style-scope ytd-video-view-count-renderer span");
    if (counter != undefined) {
        var data = localStorage.getItem("youtube_view_noter");
        if (data == null || data == undefined) {
            data = {};
        } else {
            data = JSON.parse(data);
        }
        var noted = false;
        if (data == null || data == undefined) {
            data = {};
            data[window.location.href] = ["[" + (new Date()) + ": " + counter.innerText + "]"];
            noted = true;
        } else if (data[window.location.href] == undefined) {
            data[window.location.href] = ["[" + (new Date()) + ": " + counter.innerText + "]"];
            noted = true;
        } else {
            //data[window.location.href].push("[" + (new Date()) + ": " + counter.innerText + "]");
            var lastElem = data[window.location.href][data[window.location.href].length - 1];
            if (lastElem.indexOf(counter.innerText + "]") == -1) {//if the viewcount is not noted
                data[window.location.href].push("[" + (new Date()) + ": " + counter.innerText + "]");
                noted = true;
            }
        }
        localStorage.setItem("youtube_view_noter", JSON.stringify(data));
        if(noted) {
            console.log("[youtube_view_noter_extension] background script ran " + counter.innerText + " noted....");
        }
    } else {
        console.log("[youtube_view_noter_extension] counter is undefined...");
    }
}, DELAY);