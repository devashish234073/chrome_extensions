console.log("I am running");
var e = document.querySelectorAll("span[data-hovercard-id]");
if (e != undefined) {
    var objj = {};
    var last=  "";
    for (var i = 0; i < e.length; i++) {
        var email = e[i].getAttribute("data-hovercard-id");
        if(last!=email) {
            e[i].style.fontSize = "10px";
            var data = e[i].innerText;
            if(objj[email]==undefined) {
                objj[email] = [data];
            } else {
                objj[email].push(data);
            }
        }
        if(last==email) {
            last = "";
        } else {
            last = email;
        }
    }
    /*var obj2 = {};
    for(var k in objj) {
        //console.log(k+" ["++"] "+" : "+);
        obj2[k] = objj[k].length;
    }*/
    localStorage.setItem("gmail_view_noter", JSON.stringify(objj));
    chrome.runtime.sendMessage({ cntr: JSON.stringify(objj) }, function (response) {
        console.log(response.farewell);
    });
}