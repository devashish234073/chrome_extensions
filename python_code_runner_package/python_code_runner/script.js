function $(selector) {
    var obj = document.querySelector(selector);
    return obj;
}

function _(tag) {
    return document.createElement(tag);
}

var data = $("#data");
var output = $("#output");
let codes = $("#codes");

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    //tabid.innerText = tabs[0].id;
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ['srciptToRunOnTab.js']
        });
});

$("#runBtn").addEventListener("click",runCode);

function runCode() {
    const xhr = new XMLHttpRequest();
    const url = 'http://localhost:9999/run';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            let out = JSON.parse(xhr.responseText);
            $("#output").innerText = out.output;
        } else {
            $("#output").innerText = 'Error: ' + xhr.responseText;
        }
    };
    xhr.onerror = function () {
        $("#output").innerText = 'Request failed';
    };
    xhr.send(data.value);
}

codes.addEventListener("change", () => {
    data.value = codes.value;
    runCode();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.code != undefined) {
            let allCodes = request["code"];
            for (let i = allCodes.length - 1; i >= 0; i--) {
                let opt = _("option");
                opt.innerText = "Code " + i;
                opt.value = allCodes[i];
                codes.appendChild(opt);
            }
            data.value = allCodes[allCodes.length - 1];
            setTimeout(() => {
                runCode();
            }, 1000);
            sendResponse({ farewell: request["code"] + " received" });
        }
    }
);