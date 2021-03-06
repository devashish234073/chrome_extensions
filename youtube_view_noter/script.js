var tabid = document.querySelector("#tabid");
var pageTitle = document.querySelector("#pageTitle");
var tabIcon = document.querySelector("#tabIcon");
var mainTable = document.querySelector("#mainTable");
var dataTable = document.querySelector("#dataTable");
console.log(chrome.tabs);



async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    pageTitle.style.color = "white";
    if(tab.url.indexOf("https://www.youtube.com/watch")==0){
        pageTitle.style.backgroundColor = "green";
        pageTitle.innerText = "Youtube video playing";
    } else if(tab.url.indexOf("https://www.youtube.com")==0){
        pageTitle.style.backgroundColor = "red";
        pageTitle.innerText = "Youtube site. But no video playing.";
    } else {
        pageTitle.style.backgroundColor = "red";
        pageTitle.innerText = "Not youtube site.";
    }
    //pageTitle.innerText = JSON.stringify(tab);
    tabIcon.src = tab["favIconUrl"];
    return tab;
}

function noteView(url,views) {
    var tr = document.createElement("tr");
    tr.setAttribute("class","dataRow");
    var td = document.createElement("td");
    td.setAttribute("colspan","2");
    td.innerText = url;
    tr.appendChild(td);
    dataTable.appendChild(tr);
    dataTable.style.height = "280px";
    for(let i=0;i<views.length;i++) {
        var v = views[i];
        var vs = v.split("):");
        if(vs.length==2) {
            let tr1 = document.createElement("tr");
            tr1.setAttribute("class","dataRow");
            var td1 = document.createElement("td");
            var td2 = document.createElement("td");
            td1.style.fontSize = "10px";
            td2.style.fontSize = "10px";
            tr1.appendChild(td1);
            tr1.appendChild(td2);
            dataTable.appendChild(tr1);
            td1.innerText = (vs[0]+")").replace("[","");
            td2.innerText = vs[1].replace("]","");
        }
    }
    /*var obj = {};
    chrome.storage.sync.get([url], function(result) {
        if(result!=undefined && result.value!=undefined) {
            obj[url] = result.value + "\r\n" + views;
        } else {
            obj[url] = views;
        }
        td1.innerText = url;
        td2.innerText =  obj[url];
    });
    chrome.storage.sync.set(obj, function() {
        console.log('Value is set to ' + JSON.stringify(obj));
    });*/
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
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.cntr!= undefined ) {
        noteView(sender.tab.url,request["cntr"][sender.tab.url]);
        sendResponse({farewell: request["cntr"][sender.tab.url]+" received"});
      } 
    }
  );

function clearAllData() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        tabid.innerText = tabs[0].id;
        chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ['clearAllData.js']
        });
    });
    var dataRow = document.querySelectorAll(".dataRow");
    for(var i=0;i<dataRow.length;i++) {
        dataRow[i].style.display = "none";
    }
}

var clearAllDataBtn = document.querySelector("#clearAllDataBtn");
clearAllDataBtn.addEventListener("click",clearAllData);