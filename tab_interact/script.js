var tabid = document.querySelector("#tabid");
var pageTitle = document.querySelector("#pageTitle");
var tabIcon = document.querySelector("#tabIcon");

console.log(chrome.tabs);

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    //pageTitle.innerText = JSON.stringify(tab);
    tabIcon.src = tab["favIconUrl"];
    return tab;
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