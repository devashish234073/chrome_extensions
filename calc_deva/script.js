var screen = document.querySelector("#screen");
var WAITING = "WAITING";
var RESULT = "RESULT";
var OPERATOR = "OPERATOR";
var SCREEN_STATE = "WAITING";//valid values WAITING, RESULT
var calcNums = document.querySelectorAll(".calcNums");
for (var i = 0; i < calcNums.length; i++) {
    var calcNum = calcNums[i];
    addCalcNumClickListener(calcNum, calcNum.innerText);
}
function addCalcNumClickListener(calcNum, value) {
    calcNum.addEventListener("click", function () {
        printObj({ "type": "BEFORE" });
        if (SCREEN_STATE == WAITING) {
            screen.value = screen.value + String(value);
            printObj({ "type": "appended " + value });
        } else if (SCREEN_STATE == RESULT || SCREEN_STATE == OPERATOR) {
            screen.value = String(value);
            printObj({ "type": "added " + value });
            SCREEN_STATE = WAITING;
        }
        printObj({ "type": "AFTER" });
    });
}
function printObj(obj) {
    var obj2 = {};
    obj2["NUM1"] = NUM1;
    obj2["NUM2"] = NUM2;
    obj2["OPR"] = OPR;
    obj2["SCREEN_STATE"] = SCREEN_STATE;
    obj["state"] = obj2;
    console.log(JSON.stringify(obj));
}
var calcDot = document.querySelector("#calcDot");
calcDot.addEventListener("click", function () {
    printObj({ "type": "BEFORE" });
    if (screen.value.indexOf(".") > -1) {
        return;
    }
    if (SCREEN_STATE == WAITING) {
        if (screen.value == "") {
            screen.value = "0";
        }
        screen.value = screen.value + ".";
        printObj({ "type": "appended dot(.)" });
    } else if (SCREEN_STATE == RESULT) {
        printObj({ "type": "added dot(0.)" });
        screen.value = "0.";
        SCREEN_STATE = WAITING;
    }
    printObj({ "type": "AFTER" });
});
var calcOprs = document.querySelectorAll(".calcOpr");
for (var i = 0; i < calcOprs.length; i++) {
    var calcOpr = calcOprs[i];
    addClickListenerForCalcOpr(calcOpr, calcOpr.innerText);
}

var NUM1 = null;
var NUM2 = null;
var OPR = null;  
var clearBtn = document.querySelector("#clearBtn");
clearBtn.addEventListener("click",function(){
    console.log("clear called....");
    NUM1 = null;
    NUM2 = null;
    OPR = null;
    SCREEN_STATE = WAITING;
    screen.value = "";
});
function addClickListenerForCalcOpr(calcOpr, value) {
    calcOpr.addEventListener("click", function () {
        if(screen.value=="") {
            printObj({ "type": "__NOP__" });
            return;
        }
        printObj({ "type": "BEFORE" });
        if (value != "=") {
            if ((NUM1 == null && OPR == null) || SCREEN_STATE==RESULT || (SCREEN_STATE==WAITING && OPR == null && NUM2==null)) {
                NUM1 = parseFloat(screen.value);
                OPR = value;
                SCREEN_STATE = OPERATOR;
                printObj({ "type": "num1 and opr set" });
            } else if (NUM1 != null && OPR != null) {
                if (NUM2 == null) {
                    OPR = value;//operator changed by user
                    SCREEN_STATE = OPERATOR;
                    printObj({ "type": "opr changed" });
                } else {
                    NUM1 = parseFloat(screen.value);
                    OPR = value;//operator set after result
                    getResult();
                    printObj({ "type": "result calculated on opr press" });
                }
            }
        } else {
            NUM2 = parseFloat(screen.value);
            getResult();
        }
        printObj({ "type": "AFTER" });
    });
}
function getResult() {
    if (NUM1 != null && NUM2 != null && OPR != null) {
        if (OPR == "+") {
            NUM1 = NUM1 + NUM2;
        } else if (OPR == "-") {
            NUM1 = NUM1 - NUM2;
        } else if (OPR == "*") {
            NUM1 = NUM1 * NUM2;
        } else if (OPR == "/") {
            if (NUM2 == 0) {
                NUM1 = 0;
                alert("can't divide by 0");
            } else {
                NUM1 = NUM1 / NUM2;
            }
        }
    }
    NUM2 = null;
    OPR = null;
    screen.value = NUM1;
    SCREEN_STATE = RESULT;
}