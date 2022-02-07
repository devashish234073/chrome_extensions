document.body.style.backgroundColor = "lightgreen";
//For youtube
var youtubeTitle = document.querySelectorAll("#video-title");
if (youtubeTitle != undefined) {
    for (var i = 0; i < youtubeTitle.length; i++) {
        if (i % 3 == 0) {
            youtubeTitle[i].style.backgroundColor = "red";
        } else if (i % 3 == 1) {
            youtubeTitle[i].style.backgroundColor = "green";
        } else if (i % 3 == 2) {
            youtubeTitle[i].style.backgroundColor = "blue";
        }
        youtubeTitle[i].style.padding = "10px";
        youtubeTitle[i].style.borderRadius = "10px";
        youtubeTitle[i].style.boxShadow = "0px 0px 18px lightgreen";
    }
    var viewsCounter = document.querySelectorAll("span.ytd-video-meta-block");
    if(viewsCounter!=undefined) {
        for(var i=0;i<viewsCounter.length;i++) {
            var cntr = viewsCounter[i];
            cntr.innerText = "No views | 0 views";
        }
    }
}
//For Google Searchbox
var googleInpt = document.querySelector("input[type='text']");
if (googleInpt != undefined && googleInpt.getAttribute("aria-label") == "Search") {
    if (googleInpt.getAttribute("jsaction") != undefined) {
        if (googleInpt.getAttribute("jsaction").startsWith("paste")) {
            googleInpt.style.backgroundColor = "red";
            googleInpt.style.color = "white";
            googleInpt.style.fontSize = "20px";
            googleInpt.value = "I will not search anything today";
        }
    }
}
//For Google Search button
var googleSearchBtn = document.querySelector("input[value='Google Search']");
if (googleSearchBtn != undefined) {
    googleSearchBtn.value = "Mera "+parseInt(Math.random()*100)+" Search";
    googleSearchBtn.style.height = "40px";
    googleSearchBtn.style.fontSize = "18px";
}
//For stackoverflow
var questionHyperLnk = document.querySelector(".question-hyperlink");
if(questionHyperLnk!=undefined){
    questionHyperLnk.innerText = "Why is earth so round?";
}