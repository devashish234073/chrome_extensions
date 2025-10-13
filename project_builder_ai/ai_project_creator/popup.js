let btn = document.querySelector("#capture");
let out = document.querySelector("#out");
let modelContainer = document.querySelector('#modelContainer');
// support both id and class names for backward compatibility
let overlay = document.getElementById('progress-overlay') || document.querySelector('.progressOverlay') || document.querySelector('#progress-overlay');
if (overlay) overlay.style.display = 'none';

btn.onclick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let results = await chrome.scripting.executeScript({
        target: { tabId: tab.id }, // Specify the target tab
        func: () => {
            let b = document.querySelector(".response-meesage-container");
            return b.innerText;
        },
        args: ['argument1', 123] // Optional arguments to pass to the function
    });
    out.innerText = results[0].result;
    let resp = await callOllamaWithResp(results[0].result);
    if(resp.error) {
        out.innerText = resp.error + (resp.time ? ' ('+resp.time+')' : '');
        return;
    }
    const json = resp.json || resp.data || [];
    const elapsed = resp.time || '';
    for(let i=0;i<json.length;i++) {
        let data = json[i];
        let fileName = document.createElement("p");
        fileName.innerText = data.fileName + " - " + data.path;
        let ta = document.createElement("textarea");
        ta.innerText = data.content;
        document.body.appendChild(fileName);
        document.body.appendChild(ta);
    }
    out.innerText = json.length + " file details captured. Time taken: " + elapsed;
    /*
        .then((results) => {
            out.innerText = results[0].result;
            let resp = await callOllamaWithResp(results[0].result);
        });*/
}

function formatMsAsMinutesSeconds(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} minute ${seconds} second${seconds !== 1 ? 's' : ''}`;
}

async function callOllamaWithResp(result) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "model": modelContainer.value,
        "prompt": "Read this: "+result+" just return all the filenames, path and content that needs to be created here java ones as well as non java files, for java files make sure java filename case is mathing the class name case with the extension for non java files return filename from above text as it is, all data should be  in a json structure with this data which will be a list of object each containing fileName, content and path attributes as mandatory(path will containing the full path under which file needs to be created) , the content attribute will be having content of the file. just return the json list containing all these and nothing else",
        "stream": false,
        "think": false
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    if (overlay) overlay.style.display = 'flex';
    let resp = "";
    const start = Date.now();
    try {
        resp = await fetch("http://localhost:3000/ollama", requestOptions);
    } catch(e) {
        const elapsed = Date.now() - start;
        const timeStr = formatMsAsMinutesSeconds(elapsed);
        if (overlay) overlay.style.display = 'none';
        return {"error":"Error calling ollama api", time: timeStr};
    }
    const elapsed = Date.now() - start;
    const timeStr = formatMsAsMinutesSeconds(elapsed);
    if (overlay) overlay.style.display = 'none';
    if(!resp.ok) {
        return {"error":"Error calling ollama api", time: timeStr};
    }

    const parsed = await resp.json();
    return { json: parsed, time: timeStr };
}