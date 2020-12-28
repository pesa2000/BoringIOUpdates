var windowStats = require('electron').remote.getGlobal('windowStats')
var https = require('https')
var http = require('http')
//const moment = require("moment")
const pool = require('electron').remote.getGlobal('pool')
console.log("All connections: " + pool._allConnections.length)
console.log("Free connections: " + pool._freeConnections.length)
console.log(pool)
var path = require("path")
const moment = require("moment")
const { isParameter } = require('typescript')
const { parse } = require('path')

var UserId = require('electron').remote.getGlobal('UserId')
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))

var Valuta = ""
var flag = true
var Conversion = 1

GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    pool.getConnection(function(err,connection){
        if(err)console.log(err)
        connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
            if(error)console.log(error)
            //console.log(results[0].Valuta1)
            Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
            connection.release()
            switch(Valuta){
                case "$":
                    Conversion = 1
                break;
                case "€":
                    Conversion = 0.86
                break;
                case "£":
                    Conversion = 0.78
                break;
            }
        })
    })
}

var GlobalFilter = parseInt($("#FilterDate").val())
var PrimoCaricamento = true

var Done = false

function sleep(ms) {
    try{
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    catch(err){
      console.log(err)
    }
}

function GetTodaysDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    return today;
  }

function GetNewDateYear(){
    var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    //console.log(d[2])
    return d[2]
}
  
function GetNewDateMonth(){
    var m = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    //console.log(m[1])
    return m[1]
}
  

function GetDateRightFormat(DateToChange){
    return moment(DateToChange).format('MMMM do YYYY')
}

$(document).ready(async () => {
    console.log("Documento Pronto")
    ipc.send("ReturnStripeSub")
})

ipc.on("ReturnedSub",(event,arg) => {
    ipc.send("RequestedMonthFilter")
})
ipc.on("ReturnedMonthFilter",(event,arg) => {
    if(flag == true){
        flag = false
        if(arg == "Year"){
            $("#FilterDate").val("Year")
        }else if(arg == "Lifetime"){
            $("#FilterDate").val("Lifetime")
        }else{
            $("#FilterDate").val(parseInt(arg))
        }
        LoadStats(arg)
        ChangeLog()
    }
})

async function Changed(){
    ipc.send("StoreSavedMonthFilter",$("#FilterDate").val())
    location.reload()
}

async function LoadStats(Filter){
    console.log("Funzione Load stats")
    GlobalFilter = Filter
    ChangeValues()
}

function ChangeValues(){
    ipc.send("RequestedStats",{Filter:GlobalFilter})
}

ipc.on("ReturnedStats",(event,arg1) => {
    var Res = arg1
    console.log(Res)
    $("#InventoryValue").text(Valuta + "" + parseInt(Conversion * Res.InventoryValue).toString())
    $("#InventoryValueNumber").text(Res.NumberOfItemsRetailResell + " items")
    $("#InventoryRetail").text(Valuta + "" + parseInt(Res.InventoryRetail).toString())
    $("#InventoryRetailNumber").text(Res.NumberOfItemsRetailResell + " items")
    $("#Profit").text("Profit: " + Valuta + "" + parseInt(Res.Profit).toString())
    $("#Purchases").text(Valuta + "" + parseInt(Res.Purchases).toString())
    $("#PurchasesNumber").text(Res.NumberOfItemsPurchases + " items")
    $("#Sales").text(Valuta + "" + parseInt(Res.InventorySales).toString())
    $("#SalesNumber").text(Res.NumberOfItemsSold + " items")
    $("#Return").text(Valuta + "" + parseInt(Res.Return).toString())
})

function GetFormattedNumber(Number){
    var N = Number.toString().split(".")
    N[0] = N[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
    return N[0]
}

function ChangeLog(){
    pool.getConnection(function(err,connection){
        if(err)console.log(err)
        connection.query("SELECT * FROM inventario WHERE IdUtente = ? ORDER BY DataAggiunta DESC LIMIT 2",UserId,function(error,results,fields){
            if(error)console.log(error)
            for(var i of results){
                $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-primary text-dark","fa-list","text-primary",i.NomeProdotto,i.DataAggiunta,"Inventory"))
            }
            connection.query("SELECT * FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0 ORDER BY DataVendita DESC LIMIT 2",UserId,function(error,results,fields){
                if(error)console.log(error)
                for(var i of results){
                    $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-success text-dark","fa-tag","text-success",i.NomeProdotto,i.DataVendita,"Sales"))
                }
                connection.query("SELECT * FROM spedizioni WHERE IdUtente = ? ORDER BY DataAggiunta DESC LIMIT 2",UserId,function(error,results,fields){
                    if(error)console.log(error)
                    for(var i of results){
                        $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-warning text-dark","fa-truck","text-warning",i.Corriere,i.DataAggiunta,"Sales"))
                    }
                    connection.query("SELECT * FROM costi WHERE IdUtente = ? ORDER BY DataAggiunta DESC LIMIT 2",UserId,function(error,results,fields){
                        console.log(results)
                        if(error)console.log(error)
                        for(var i of results){
                            $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-info text-dark","fa-credit-card","text-info",i.NomeSelezioneCosto,i.DataAggiunta,"Sales"))
                        }
                        connection.release()
                    })
                })
            })
        })
    })
}

function ChangeDate(DateToChange){
    return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

function CreateLogElement(Class1,Class2,Class3,Name,Date,Section){
    var DateDiff = moment.duration(moment(GetTodaysDate()).diff(moment(ChangeDate(Date))))

    var DaysDiff = parseInt(DateDiff.asDays())
    if(DaysDiff == 0){
        DaysDiff = "Today"
    }else if(DaysDiff == 1){
        DaysDiff = "Yesterday"
    }else{
        DaysDiff = DaysDiff + " days ago"
    }
    //console.log(DateDiff)
    return  `<div class="media mb-3 hover-actions-trigger align-items-center">
            <div class="avatar avatar-xl mr-3">
            <div class="${Class1}">
                <span class="fs-0  ${Class3}">
                <span class="fas ${Class2}"></span>
                </span>
            </div>
            </div>
            <div class="media-body ml-3">
            <h6 class="mb-1"><a class="stretched-link text-900 font-weight-semi-bold">${Name}</a></h6>
            <div class="fs--1"><span class="font-weight-semi-bold">${Section}</span><span class="font-weight-medium text-600 ml-2">${DaysDiff}</span></div>
        </div>
        <hr class="border-200" />
        </div>`
}

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
