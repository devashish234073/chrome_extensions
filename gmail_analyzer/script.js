var tabid = document.querySelector("#tabid");
var pageTitle = document.querySelector("#pageTitle");
var tabIcon = document.querySelector("#tabIcon");
var mainTable = document.querySelector("#mainTable");
var dataTable = document.querySelector("#dataTable");
var spnChkUnmask = document.querySelector("#spnChkUnmask");
var chkUnmask = document.querySelector("#chkUnmask");
console.log(chrome.tabs);

spnChkUnmask.style.display = "none";

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    pageTitle.style.color = "white";
    if (tab.url.indexOf("https://mail.google.com/") == 0) {
        pageTitle.style.backgroundColor = "green";
        pageTitle.innerText = "Gmail";
    } else {
        pageTitle.style.backgroundColor = "red";
        pageTitle.innerText = "Not gmail site.";
    }
    //pageTitle.innerText = JSON.stringify(tab);
    tabIcon.src = tab["favIconUrl"];
    return tab;
}

function maskEmail(email) {
    var es = email.split("@");
    var tmp = "";
    for(var i = 0;i<es[1].length;i++) {
        if(es[1][i]==".") {
            tmp+=".";
        } else {
            tmp+="*";
        }
    }
    return es[0]+"@"+tmp;
}

chkUnmask.addEventListener("change",function() {
    if(chkUnmask.checked) {
        var actualEmails = document.querySelectorAll("td[actualEmail]");
        for(var indxx in actualEmails) {
            var actualEmail = actualEmails[indxx];
            actualEmail.innerText = actualEmail.getAttribute("actualEmail");
        }
    } else {
        var maskedEmails = document.querySelectorAll("td[maskedEmail]");
        for(var indxx in maskedEmails) {
            var maskedEmail = maskedEmails[indxx];
            maskedEmail.innerText = maskedEmail.getAttribute("maskedEmail");
        }
    }
});

function showData(obj) {
    for(email in obj) {
        spnChkUnmask.style.display = "block";
        dataTable.style.height = "300px";
        var count = obj[email].length;
        let tr1 = document.createElement("tr");
        tr1.setAttribute("class", "dataRow");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        td1.style.fontSize = "10px";
        td2.style.fontSize = "10px";
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        dataTable.appendChild(tr1);
        var emailMasked = maskEmail(email);
        td1.innerText = emailMasked;
        td1.setAttribute("actualEmail",email);
        td1.setAttribute("maskedEmail",emailMasked);
        td2.innerText = count;
        let tr2 = document.createElement("tr");
        let td3 = document.createElement("td");
        td3.setAttribute("colspan","2");
        tr2.appendChild(td3);
        dataTable.appendChild(tr2);
        var titles = "";
        for(var indx in obj[email]) {
            titles+=obj[email][indx]+"\r\n";
        }
        td3.innerText = titles;
        td3.style.fontSize = "10px";
        td3.style.color = "yellow";
    }
}

getCurrentTab();

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    tabid.innerText = tabs[0].id;
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ['srciptToRunOnTab.js']
        });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.cntr != undefined) {
            showData(JSON.parse(request["cntr"]));
            sendResponse({ farewell: request["cntr"] + " received" });
        }
    }
);