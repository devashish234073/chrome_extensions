let btn = document.querySelector("#capture");
let out = document.querySelector("#out");
let overlay = document.querySelector(".progressOverlay");
overlay.style.display = 'none';

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
    out.innerText = JSON.stringify(resp);
    /*
        .then((results) => {
            out.innerText = results[0].result;
            let resp = await callOllamaWithResp(results[0].result);
        });*/
}

async function callOllamaWithResp(result) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "model": "qwen3:1.7b",
        "prompt": "Read this: "+result+" just return all the filenames that needs to be created here java ones as well as non java files, for java files make sure java filename case is mathing the class name case with the extension for non java files return filename from above text as it is, all data should be  in a json structure with this data which will be a list of object each containing fileName and path attributes as mandatory and for java files have a package attribute also for non java files just the fileName and path. just return the json list nothing else",
        "stream": false,
        "think": false
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    overlay.style.display = 'flex';
    let resp = await fetch("http://localhost:3000/ollama", requestOptions);
    overlay.style.display = 'none';
    if(!resp.ok) {
        return {"error":"Error calling ollama api"};
    }

    return resp.json();
}