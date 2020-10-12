const { userInfo } = require('os')

const moment = require("moment")
const ipc = require('electron').ipcRenderer
const connection = require('electron').remote.getGlobal('conn')
const bcrypt = require("bcrypt")

var UserId = 0
var UserDB = []

ipc.send("ReturnStripeSub")

function ChangePaymentMethod(){
    var CardNumber = $("#CardNumber").val()
    var ExpirationDate = $("#ExpirationDate").val().split("/")
    var CardMonth = ExpirationDate[0]
    var CardYear = ExpirationDate[1]
    var CardCvc = $("#Cvc").val()

    var Card = {
        number: CardNumber,
        month: CardMonth,
        year: CardYear,
        cvc: CardCvc
    }
    ipc.send("ChangePaymentMethod",Card)
}

ipc.on("NewPaymentMethod",(event,arg) => {
    console.log("Risultato")
    console.log(arg)
    if(arg == false){
        $("#errorLabelPayment").val("Incorrect card information or this subscription is deleted.")
    }else{
        console.log("PaymentMethodChanged")
        connection.query("UPDATE utenti SET PaymentId = ? WHERE UserId = ?",[arg.Obj.default_payment_method,UserId],function(error,results,fields){
            if(error) console.log(error)
            $("#successLabelPayment").val("Your subscription is now updated!, you can close the page now.")
        })
    }
})


ipc.send("getUserId")
ipc.on("ReturnedId",async (event,arg) => {
    UserId = arg
    connection.query("SELECT * FROM utenti WHERE UserId = ?",UserId,function(error,results,fields){
        console.log(results)
        UserDB = results
        document.getElementById("AccountName").innerHTML = results[0].Username
        document.getElementById("AccountEmail").innerHTML = results[0].Email
        document.getElementById("AccountId").innerHTML = results[0].Username + "_" + UserId
        document.getElementById("CreationDate").innerHTML = moment(results[0].DataCreazione).format("MMM Do YY")
    })
})

function deleteSubscription(){
    ipc.send("DeleteSubscription")
}
ipc.on("SubscriptionDeleted",(event,arg) => {
    console.log("Deleted")
})

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
    var user = arg.User
    var payment = arg.Payment

    console.log(payment)

    var l = document.getElementsByName("stat")
    l[0].innerHTML += user.id
    l[1].innerHTML += user.customer
    l[2].innerHTML += GetDateRightFormat(user.start_date * 1000)
    l[3].innerHTML += GetDateRightFormat(user.current_period_end * 1000)
    l[4].innerHTML += user.status

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

    document.getElementById("AccountLastNumbers").innerHTML = payment.card.last4
    document.getElementById("PaymentType").innerHTML = payment.card.brand
})

function GetDateRightFormat(DateToChange){
    return moment(DateToChange).format('DD[-]MM[-]YYYY')
}