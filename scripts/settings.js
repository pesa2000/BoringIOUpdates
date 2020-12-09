const moment = require("moment")
const ipc = require('electron').ipcRenderer
const pool = require('electron').remote.getGlobal('pool')
const bcrypt = require("bcrypt")
var UserId = require('electron').remote.getGlobal('UserId')
const { createConnection } = require("net")

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
    //console.log(arg)
})

ipc.on("ReturnedSub",async(event,arg) => {
    var user = arg.User
    var sub = arg.Subscription
    if(sub != null){
        document.getElementById("TypeOfMembership").innerText = "Monthly user"
    }else{
        document.getElementById("TypeOfMembership").innerText = "Lifetime user"
    }
    document.getElementById("Username").innerHTML = user.Username + "<small class='fas fa-check-circle text-primary ml-1' data-toggle='tooltip' data-placement='right' title='Verified' data-fa-transform='shrink-4 down-2'></small>"
    document.getElementById("Membership").innerHTML += " " + GetDateRightFormat(user.DataCreazione)
    await sleep(500)
    $("#Preloader1").css("display","none")
})

function sleep(ms) {
    try{
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    catch(err){
        console.log(err)
    }
}

function GetDateRightFormat(DateToChange){
    return moment(DateToChange).format('DD[-]MM[-]YYYY')
}

function changeLanguage(){
    pool.getConnection(function(err,connection){
        connection.query("UPDATE utenti SET Lingua = ? WHERE UserId = ?",[document.getElementById("SelectLanguage").value,UserId],function(err,results,fields){
            connection.release()
            if(err){
                console.log(err)
            }
        })
    })
}

function changeCurrency(){
    var Valuta
    var ConversioneValuta
    var ValutaStringa
    switch(document.getElementById("SelectCurrency").value){
        case "DOLLARS":
            ValutaStringa = "DOLLARS"
            Valuta = "&#36"
            ConversioneValuta = 1
        break;
        case "EUROS":
            ValutaStringa = "EUROS"
            Valuta = "&#8364"
            ConversioneValuta = 0.8600
        break;
        case "POUNDS":
            ValutaStringa = "POUNDS"
            Valuta = "£"
            ConversioneValuta = 0.7500
        break;
    }
    pool.getConnection(function(err,connection){
        connection.query("UPDATE utenti SET Valuta = ?, ValutaStringa = ?, ConversioneValuta = ?  WHERE UserId like ?",[Valuta,ValutaStringa,ConversioneValuta,UserId],function(err,results,fields){
            if(err){
                console.log(err)
            }
        })
    })
}