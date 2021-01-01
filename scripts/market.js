var moment = require('moment')
const { idText } = require('typescript')
var config = require('electron').remote.getGlobal('configuration')
var connection = require('electron').remote.getGlobal('conn')
var windowStats = require('electron').remote.getGlobal('windowStats')
var https = require('https')
var http = require('http')
const pool = require('electron').remote.getGlobal('pool')

var timer
var GlobalIndex = 0
const path = require("path")
var DivStats2 = ""
var GlobalProducts = []
var GlobalProductsDetails = []

var UserId = require('electron').remote.getGlobal('UserId')
var Valuta = require('electron').remote.getGlobal('ValutaAcc')
console.log("Valuta")
console.log(Valuta)
console.log("Id Utente")
console.log(UserId)
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))

var Conversion = " "
var StringValuta = " "

GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    pool.getConnection(function(err,connection){
        if(err)console.log(err)
        connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
            if(error)console.log(error)
            console.log(results[0].Valuta1)
            Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
            Currency = Valuta
            switch(Valuta){
                case "$":
                    StringValuta = "USD"
                break;
                case "€":
                    StringValuta = "EUR"
                break;
                case "£":
                    StringValuta = "GBP"
                break;
            }
            connection.query("SELECT Conversione FROM valute WHERE CodiceValuta = ?",StringValuta,function(err,results,fields){
                connection.release()
                Conversion = results[0].Conversione
            })
        })
    })
}

window.setInterval(CheckConnection,5000)

function minimize(){
    ipc.send("Minimize")
}
function maximize(){
    ipc.send("Maximize")
}
function quit(){
    ipc.send("AppQuit")
}

function FlipDateAndChange(DateToChange){
    return moment(DateToChange).format('DD[/]MM[/]YYYY')
}


function SelectedShoesNr(Index){
    var SelectedShoes = GlobalProducts[Index]
    GlobalIndex = Index
    $("#imageProd").attr("src",SelectedShoes.media.imageUrl)
    $("#nameProd").text(SelectedShoes.name)
    CreateLog(`Searched a pair of ${SelectedShoes.name}`,"Market","Search",moment().format('MMMM Do YYYY, h:mm:ss a'))
    console.log("Debug Market")
    console.log(SelectedShoes)
    var RetailPrice = SelectedShoes.price
    $("#UrlToHide").val("https://stockx.com/"+SelectedShoes.url)
    $("#dateProd").text(FlipDateAndChange(SelectedShoes.release_date))
    $("#prodRetail").text("Retail: " + Currency + "" + RetailPrice)
    $("#prodSold").text("Tot.Sold: " + SelectedShoes.deadstock_sold)
    ipc.send("RequestedShoeDetails",{Prod: SelectedShoes.url,Index: "Market"})
}

ipc.on("ReturnedProductDetails", async(event,arg) => {
    console.log("Details for " + GlobalIndex)
    console.log(GlobalProducts[GlobalIndex])
    console.log(arg.Prod)
    for(var Variant of arg.Prod.variants){
        DivStats2 += CreateTemplateVariant(Variant)
    }
    document.getElementById("stats").innerHTML += DivStats2
    $("#stats").css("display","-webkit-box")
    $("#stats").css("display","-ms-flexbox")
    $("#stats").css("display","flex")

    document.getElementById("ricerca").innerHTML = ""
    $("#ricerca").css("display","none")
})
function CreateTemplateVariant(Variant){
    return "<div class='mb-4 col-md-6 col-lg-4'>" +
            "<div class='card-body' style='background-color: #132238;border-radius: 4px;cursor: pointer;'>" +
                "<div class='row justify-content-between align-items-center'>" +
                "<div class='col'>" +
                "<div class='media'>" +
                    "<div class='calendar mr-2'><span class='calendar-month'>Size</span><span class='calendar-day'>"+Variant.size+"</span></div>" +
                    "<div class='media-body fs--1'>" +
                        "<h3 class='fs-0 text-warning'>" +
                        "Value: " + Currency + "" + parseFloat(Conversion * Variant.market.averageDeadstockPrice).toFixed(2) +
                        "</h3>" +
                        "<br>" +
                        "<span class='badge badge rounded-capsule badge-soft-success'>Lowest: "+ Currency + "" + parseFloat(Conversion * Variant.market.lowestAsk).toFixed(2) + "</span>&nbsp&nbsp" +
                        "<span class='badge badge rounded-capsule badge-soft-danger'>Highest: " + Currency + "" + parseFloat(Conversion * Variant.market.highestBid).toFixed(2) + "</span>" +
                    "</div>" +
                    "</div>" +
                "</div>" +
                "</div>" +
            "</div>" +
            "</div>"
}

function createTemplateResearch(Prods,Index){
    return "<div class='media' style='padding-top:10px;cursor: pointer;' onclick = 'SelectedShoesNr("+ Index +")'>" +
    "<div class='mr-2'> " +
        "<img src='"+Prods[Index].media.imageUrl+"' style='width: 64px;border-radius: .25rem !important;margin-left: 5px;'>"+
    "</div>" +
    "<div class='media-body fs--1'>" +
        "<h6 class='fs-0'>" +Prods[Index].name+ "&nbsp&nbsp</h6><br>" +
        "<span class='badge badge rounded-capsule badge-soft-success'>" + FlipDateAndChange(Prods[Index].release_date)+ "</span>" +
    "</div> " +
    "</div>"
}

ipc.on("ReturnedProducts",async (event,arg) => {
    document.getElementById("ricerca").innerHTML = ""
    GlobalProducts = arg
    console.log(arg)
    for(var i = 0; i < 4; i++){
        document.getElementById("ricerca").innerHTML += createTemplateResearch(arg,i)
    }   
    mostraRicerca()
})

function mostraRicerca(){
    document.getElementById('ricerca').style.display="block";
}

function Searching(){
    document.getElementById("ricerca").innerHTML = ""
    $("#ricerca").css("display","none")
    var ShoesToSearch = $('#ShoesName')
    if(ShoesToSearch.val() != ""){
        ipc.send("SearchProducts",ShoesToSearch.val())
    }
}

function SearchShoes(){
    clearTimeout(timer)
    timer = setTimeout(Searching, 600)
}

function CreateLog(Mess,Sec,Act,DateTime){
    var ObjTosend = {
      Message: Mess,
      Section: Sec,
      Action: Act,
      DateTime: DateTime
    }
    ipc.send("CreateLog",ObjTosend)
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

function OpenStockX(){
    var Url = $("#UrlToHide").val()
    ipc.send("WindowTracking",Url)
}