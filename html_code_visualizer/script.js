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

function renderCode() {
    output.innerHTML = data.value;
    /*let scripts = output.querySelectorAll("script");
    for(let i=0;i<scripts.length;i++) {
        let scriptCode = scripts[i];
        let script = _("script");
        script.innerText = scriptCode;
        document.body.appendChild(script);
    }*/
}

codes.addEventListener("change",()=>{
    data.value = codes.value;
    renderCode();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.code != undefined) {
            let allCodes = request["code"];
            for(let i=allCodes.length-1;i>=0;i--) {
                let opt = _("option");
                opt.innerText = "Code "+i;
                opt.value = allCodes[i];
                codes.appendChild(opt);
            }
            data.value = allCodes[allCodes.length-1];
            setTimeout(()=>{
                data.addEventListener("keyup",renderCode);
                renderCode();
            },1000);
            sendResponse({ farewell: request["code"] + " received" });
        }
    }
);