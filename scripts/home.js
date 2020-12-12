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

var UserId = require('electron').remote.getGlobal('UserId')
console.log("Id Utente")
console.log(UserId)
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))

var Valuta = ""
var flag = true

GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    pool.getConnection(function(err,connection){
        if(err)console.log(err)
        connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
            if(error)console.log(error)
            console.log(results[0].Valuta1)
            Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
            connection.release()
            console.log(Valuta)
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
    console.log("Stripe subscription")
    console.log(arg)
    //document.getElementById("SubscriptionEnd").innerHTML = GetDateRightFormat(arg.User.current_period_end * 1000)
    ipc.send("RequestedMonthFilter")
})
ipc.on("ReturnedMonthFilter",(event,arg)=>{
    console.log("MESE RITORNATO DAL MAIN")
    console.log(arg)
    console.log("Il flag è" + flag)
    if(flag == true){
        flag = false
        if(arg == "Year"){
            $("#FilterDate").val("Year")
        }else if(arg == "Lifetime"){
            $("#FilterDate").val("Lifetime")
        }else if(arg == "Return"){
            $("#FilterDate").val("Return")
        }else{
            $("#FilterDate").val(parseInt(arg))
        }
        console.log("Mese scelto")
        console.log($("#FilterDate").val())
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
    if(Done == false){
        pool.getConnection(function(err,connection){
            if(err)console.log(err)
            Done = true
            var Purchases = 0
            var Profit = 0
            var NumerTot = 0
            var NumberSold = 0
            var InventorySales = 0
            var InventoryValue = 0

            if(GlobalFilter == "Year"){
                Query1 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio, SUM(PrezzoMedioResell) as Value FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 1 AND YEAR(ReleaseDate) = ?"
                Values1 = [UserId,parseInt(GetNewDateYear())]
                Query2 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0 AND YEAR(DataVendita) = ?"
                Values2 = [UserId,parseInt(GetNewDateYear())]
                Query3 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 1 AND YEAR(ReleaseDate) = ?"
                Values3 = [UserId,parseInt(GetNewDateYear())]
                Query4 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0 AND YEAR(DataVendita) = ?"
                Values4 = [UserId,parseInt(GetNewDateYear())]
            }else if(GlobalFilter == "Lifetime"){
                Query1 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio, SUM(PrezzoMedioResell) as Value FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 1"
                Values1 = [UserId]
                Query2 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0"
                Values2 = [UserId]
                Query3 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 1"
                Values3 = [UserId]
                Query4 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0"
                Values4 = [UserId]
            }else if(GlobalFilter == "Return"){
                Query1 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio, SUM(PrezzoMedioResell) as Value FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 1"
                Values1 = [UserId]
                Query2 = "SELECT SUM(Prezzovendita) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0"
                Values2 = [UserId]
                Query3 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 1"
                Values3 = [UserId]
                Query4 = "SELECT SUM(Prezzovendita) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0"
                Values4 = [UserId]
            } 
            else{
                Query1 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio, SUM(PrezzoMedioResell) as Value FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 1 AND YEAR(ReleaseDate) = ? AND MONTH(ReleaseDate) = ?"
                Values1 = [UserId,parseInt(GetNewDateYear()),parseInt(GlobalFilter)]
                Query2 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0 AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ?"
                Values2 = [UserId,parseInt(GetNewDateYear()),parseInt(GlobalFilter)]
                Query3 = "SELECT SUM(PrezzoProdotto) as Purchases,Count(*) as Conteggio FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 1 AND YEAR(ReleaseDate) = ? AND MONTH(ReleaseDate) = ?"
                Values3 = [UserId,parseInt(GetNewDateYear()),parseInt(GlobalFilter)]
                Query4 = "SELECT SUM(Profitto) as Profitto,Count(*) as Conteggio, SUM(PrezzoVendita) as PrezzoVendita FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0 AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ?"
                Values4 = [UserId,parseInt(GetNewDateYear()),parseInt(GlobalFilter)]
            }
            connection.query(Query1,Values1,function(error,results1,fields) {
                console.log(results1)
                Purchases = results1[0].Purchases
                NumberTot = results1[0].Conteggio
                InventoryValue = results1[0].Value
                connection.query(Query2,Values2,function(error,results2,fields) {
                    console.log(results2)
                    Profit = results2[0].Profitto
                    NumberSold = results2[0].Conteggio
                    InventorySales = results2[0].PrezzoVendita
                    connection.query(Query3,Values3,function(error,results3,fields) {
                        console.log(results3)
                        Purchases += results3[0].Purchases
                        NumberTot += results3[0].Conteggio
                        connection.query(Query4,Values4,function(error,results4,fields) {
                            connection.release()
                            console.log(results4)
                            Profit += results4[0].Profitto
                            NumberSold += results4[0].Conteggio
                            InventorySales += results4[0].PrezzoVendita
                            if(InventoryValue == null){
                                InventoryValue = 0
                            }
                            if(Purchases == null){
                                Purchases = 0
                            }
                            if(Profit == null){
                                Profit = 0
                            }
                            if(InventorySales == null){
                                InventorySales = 0
                            }
                            $("#InventoryValue").text(Valuta + "" +InventoryValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                            $("#Purchases").text(Valuta + "" +Purchases.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                            if(GlobalFilter == "Return"){
                                $("#Profit").text("Profit: " +Valuta + "" + (Profit).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + " ")
                            }else{
                                $("#Profit").text("Profit: " +Valuta + "" + (Profit-Purchases).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + " ")
                            }
                            $("#Sales").text(Valuta + "" +InventorySales.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                        })
                    })
                })
            })


            /*var QueryLifetime = "SELECT * FROM inventario WHERE IdUtente = ?"
            var QueryLifetime2 = "SELECT * FROM inventariocustom WHERE IdUtente = ?"
            connection.query(Query1,Values1,function(error,results,fields){
                if(error) console.log(error)
                EntireInv = results
                for(var Item of EntireInv){
                    if(Item.QuantitaAttuale == 1){
                        TotInventoryValue += Item.PrezzoMedioResell
                    }
                    TotPurchases += Item.PrezzoProdotto
                    //TotSales += Item.PrezzoVendita 
                }
                connection.query(Query2,Values2,function(error,results,fields){
                    if(error)console.log(error)
                    EntireInvCustom = results
                    for(var ItemCustom of EntireInvCustom){
                        TotPurchases += ItemCustom.PrezzoProdotto
                        //TotSales += ItemCustom.PrezzoVendita
                    }
                    $("#InventoryValue").text(Valuta + "" +TotInventoryValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                    $("#Purchases").text(Valuta + "" +TotPurchases.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                    //$("#Sales").text(Valuta + "" +TotSales.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                    connection.query(Query3,Values3,function(error,results1,fields){
                        if(error)console.log(error)
                        for(var Item of results1){
                            if(Item.QuantitaAttuale == 0){
                                TotProfitTime += Item.Profitto
                            }
                            TotSales += Item.PrezzoVendita
                        }
                        connection.query(Query4,Values4,function(error,results2,fields){
                            if(error)console.log(error)
                            for(var Item of results2){
                                if(Item.QuantitaAttuale == 0){
                                    TotProfitTime += Item.Profitto
                                }
                                TotSales += Item.PrezzoVendita
                            }
                            $("#Profit").text("Profit: " +Valuta + "" + TotProfitTime.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + " ")
                            $("#Sales").text(Valuta + "" +TotSales.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                        })
                    })
                    connection.query(QueryLifetime,UserId,function(error,results,fields){
                        if(error)console.log(error)
                        for(var Item of results){
                            if(Item.Profitto > 0){
                                TotProfitLifetime += Item.Profitto
                            }
                        }
                        connection.query(QueryLifetime2,UserId,function(error,results,fields){
                            if(error)console.log(error)
                            for(var Item of results){
                                if(Item.Profitto > 0){
                                    TotProfitLifetime += Item.Profitto
                                }
                            }
                            $("#ProfitLifetime").text("" + Valuta + "" +TotProfitLifetime.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
                            connection.release()
                        })
                    })
                })
            })*/
        })
    }
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
    console.log(ChangeDate(Date))
    console.log(GetTodaysDate())
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