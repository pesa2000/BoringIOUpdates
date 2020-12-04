const moment = require("moment")
const ipc = require('electron').ipcRenderer
const pool = require('electron').remote.getGlobal('pool')
const bcrypt = require("bcrypt")

var UserId = 0
var UserDB = []

ipc.send("ReturnStripeSub")

function minimize(){
    ipc.send("Minimize")
}

function maximize(){
    ipc.send("Maximize")
}

function quit(){
    ipc.send("AppQuit")
}

function LogOut(){
    ipc.send("LogOut")
}

function CheckConnection(){
    ipc.send("CheckConnection")
}

ipc.on("CheckedConnection", (event,arg) =>{
    console.log(arg)
})

ipc.on("ReturnedSub",(event,arg) => {
    console.log(arg)

    var l = document.getElementsByName("stat")
    var user = arg.User
    var sub = arg.Subscription
    if(sub != null){
        l[0].innerHTML += sub.id
        l[1].innerHTML += sub.customer
        l[2].innerHTML += GetDateRightFormat(sub.start_date * 1000)
        l[3].innerHTML += GetDateRightFormat(sub.current_period_end * 1000)
        l[4].innerHTML += sub.status
    
        var k = document.getElementsByName("lastUpdate")
        k[0].innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
        k[1].innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
        k[2].innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
        k[3].innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
        k[4].innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
    
        var s = document.getElementsByName("Code")
        s[0].innerHTML = 200
        s[1].innerHTML = 200
        s[2].innerHTML = 200
        s[3].innerHTML = 200

        var el = document.getElementsByName("Code")[4]
        if(user.status == "canceled"){
            s[4].innerHTML = 404
            $(el).removeClass()
            $(el).addClass("badge badge-soft-danger badge-pill")
        }else{
            s[4].innerHTML = 200
        }
    }else{
        document.getElementById("SubscriptionCard").style.display = "none"
    }

    document.getElementById("CreationDate").innerHTML += " " + GetDateRightFormat(user.DataCreazione)
    document.getElementById("AccountName").innerHTML = user.Username
    document.getElementById("AccountId").innerHTML = user.Username + "_" + user.UserId
    document.getElementById("AccountEmail").innerHTML = user.Email
})

function GetDateRightFormat(DateToChange){
    return moment(DateToChange).format('DD[-]MM[-]YYYY')
}