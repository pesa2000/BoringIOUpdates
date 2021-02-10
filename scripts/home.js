var windowStats = require('electron').remote.getGlobal('windowStats')
var https = require('https')
var http = require('http')
//const moment = require("moment")
//const JwtToken = require('electron').remote.getGlobal("JwtToken")
var path = require("path")
const moment = require("moment")
const { isParameter } = require('typescript')
const { parse } = require('path')
var Valuta = require('electron').remote.getGlobal('Valuta')
var Conversion = require('electron').remote.getGlobal('Conversion')
//const { IterateResults } = require(path.join(__dirname,"/utilityScripts/query_graphs_expenses.js"));

var UserId = require('electron').remote.getGlobal('UserId')

var flag = true

var StringValuta = "USD"

console.log("UserId")
console.log(UserId)

var GlobalFilterMonth = parseInt($("#FilterDateMonths").val())
var GlobalFilterYear = parseInt($("#FilterDateYears").val())
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
    ipc.send("RequestedFilters")
})

ipc.on("ReturnedFilters",(event,arg) => {
    var YearFilter = arg.FilterYear
    var MonthFilter = arg.FilterMonth
    console.log(YearFilter)
    console.log(MonthFilter)
    if(flag == true){
        flag = false
        if(YearFilter == "Lifetime"){
            $("#FilterDateYears").val("Lifetime")
            $("#FilterDateMonths").val("All")
        }else{
            $("#FilterDateYears").val(parseInt(YearFilter))
            if(MonthFilter == "All"){
                $("#FilterDateMonths").val("All")
            }else{
                $("#FilterDateMonths").val(parseInt(MonthFilter))
            }
        }
        LoadStats(YearFilter,MonthFilter)        
        ChangeLog()
    }
    /*if(flag == true){
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
    }*/
})

async function ChangedYears(){
    ipc.send("StoreSavedYearFilter",$("#FilterDateYears").val())
    location.reload()
}

async function ChangedMonths(){
    ipc.send("StoreSavedMonthFilter",$("#FilterDateMonths").val())
    location.reload()
}

async function LoadStats(FilterYear,FilterMonth){
    console.log("Funzione Load stats")
    GlobalFilterYear = FilterYear
    GlobalFilterMonth = FilterMonth
    ChangeValues()
}

function ChangeValues(){
    ipc.send("RequestedStats",{FilterYear:GlobalFilterYear,FilterMonth:GlobalFilterMonth})
}

ipc.on("ReturnedStats",(event,arg1) => {
    var Res = arg1
    console.log(Res)
    var TotExpenses = IterateResults(GlobalFilterYear,GlobalFilterMonth,arg1.Expenses)
    console.log("Expenses Totals")
    console.log(TotExpenses)
    var Profit = parseInt(arg1.Return - (TotExpenses.Cook + TotExpenses.Ship + TotExpenses.Custom + TotExpenses.Proxy + TotExpenses.Bot))
    $("#InventoryValue").text(Valuta + "" + parseInt(Conversion * Res.InventoryValue).toString())
    $("#InventoryValueNumber").text(Res.NumberOfItemsRetailResell + " items")
    $("#InventoryRetail").text(Valuta + "" + parseInt(Res.InventoryRetail).toString())
    $("#InventoryRetailNumber").text(Res.NumberOfItemsRetailResell + " items")
    $("#Profit").text("Profit: " + Valuta + "" + parseInt(Profit).toString())
    $("#Purchases").text(Valuta + "" + parseInt(Res.Purchases).toString())
    $("#PurchasesNumber").text(Res.NumberOfItemsPurchases + " items")
    $("#Sales").text(Valuta + "" + parseInt(Res.InventorySales).toString())
    $("#SalesNumber").text(Res.NumberOfItemsSold + " items")
    $("#Return").text(Valuta + "" + parseInt(Res.Return).toString())
    $("#ProfitSold").text(Valuta + "" + parseInt(Res.ProfitSold).toString())
    $("#ProfitSoldNumbers").text(Res.NumberOfItemsSold + " items")
})

function GetFormattedNumber(Number){
    var N = Number.toString().split(".")
    N[0] = N[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
    return N[0]
}

function ChangeLog(){
    fetch("https://www.boringio.com:9008/GetChangeLog",{
        method: 'POST',
        body: "",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": JwtToken
        },
        referrer: 'no-referrer'
    }).then(function (response) {
        console.log(response.status)
        if(response.ok){
            return response.json()
        } else {
            window.alert("Something went wrong")
        }
    }).then(async function(data){
        console.log(data)
        for(var i of data.Results1){
            $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-primary text-dark","fa-list","text-primary",i.NomeProdotto,i.DataAggiunta,"Inventory"))
        }
        for(var i of data.Results2){
            $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-success text-dark","fa-tag","text-success",i.NomeProdotto,i.DataVendita,"Sales"))
        }
        for(var i of data.Results3){
            $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-warning text-dark","fa-truck","text-warning",i.Corriere,i.DataAggiunta,"Sales"))
        }
        for(var i of data.Results4){
            $("#RecentActivities").append(CreateLogElement("avatar-name rounded-circle bg-soft-info text-dark","fa-credit-card","text-info",i.NomeSelezioneCosto,i.DataAggiunta,"Sales"))
        }
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
