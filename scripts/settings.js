const moment = require("moment")
const ipc = require('electron').ipcRenderer
const pool = require('electron').remote.getGlobal('pool')
const bcrypt = require("bcrypt")
const { createConnection } = require("net")

var UserId = 0
var UserDB = []

ipc.send("getUserId")

ipc.on("ReturnedId",(event,arg) => {
    UserId = arg
})

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

function CreateWindow(){
    ipc.send("CreateWindow","https://discord.gg/eqmkmvVGwF")
}

ipc.on("ReturnedSub",async(event,arg) => {
    console.log(arg)
    var user = arg.User
    var img = user.DiscordAvatar
    console.log(img)
    document.getElementById("Immagine").value = img
    $("#ImmagineProfilo").attr("src",img)
    var sub = arg.Subscription
    if(sub != null){
        document.getElementById("TypeOfMembership").innerText = "Monthly user"
    }else{
        document.getElementById("TypeOfMembership").innerText = "Lifetime user"
    }
    switch(arg.User.Valuta){
        case "â‚¬":
            document.getElementById("SelectCurrency").value = "EUROS"
            break;
        case "Â£":
            document.getElementById("SelectCurrency").value = "POUNDS"
            break;
        case "&#36":
            document.getElementById("SelectCurrency").value = "DOLLARS"
            break;
        case "&#8364":
            document.getElementById("SelectCurrency").value = "EUROS"
            break;
    }
    document.getElementById("Username").innerHTML = user.DiscordUsername + "<small class='fas fa-check-circle text-primary ml-1' data-toggle='tooltip' data-placement='right' title='Verified' data-fa-transform='shrink-4 down-2'></small>"
    document.getElementById("Membership").innerHTML += " " + GetDateRightFormat(user.DataCreazione)
    document.getElementById("Content").style.display = "block"
    document.getElementById("Preloader1").style.display = "none"
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
            }else{
                alert("Restart the app for apply the changes")
            }
        })
    })
}

function changeImg(){
    var NewImg = $("#Immagine").val()
    pool.getConnection(function(err,connection){
        connection.query("UPDATE utenti SET Immagine = ? WHERE UserId = ?",[NewImg,UserId],function(err,results,fields){
            connection.release()
            if(err){
                console.log(err)
            }else{
                alert("Restart the app for apply the changes")
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
            Valuta = "â‚¬"
            ConversioneValuta = 0.8600
        break;
        case "POUNDS":
            ValutaStringa = "POUNDS"
            Valuta = "Â£"
            ConversioneValuta = 0.7500
        break;
    }
    console.log(ValutaStringa)
    console.log(Valuta)
    console.log(ConversioneValuta)
    pool.getConnection(function(err,connection){
        connection.query("UPDATE utenti SET Valuta = ?, ValutaStringa = ?, ConversioneValuta = ?  WHERE UserId like ?",[Valuta,ValutaStringa,ConversioneValuta,UserId],function(err,results,fields){
            connection.release()
            if(err){
                console.log(err)
            }else{
                console.log("Fatto")
                alert("Restart the app for apply the changes")
            }
        })
    })
}