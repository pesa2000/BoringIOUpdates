var mysql = require('mysql')
var path = require('path')
var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var connection = require('electron').remote.getGlobal('conn')
var SalesList = []
var SalesListCustom = [] 
var UserId = 0

var Util = require(path.join(__dirname,"/utilityScripts/query_stats_sales.js"))

var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))

var Valuta = ""
function GetValutaAsUtf8(Id){
    connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
        if(error)console.log(error)
        console.log(results[0].Valuta1)
        Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
        console.log(Valuta)
    })
}

console.log(Util)

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

function ChangeDate(DateToChange){
    return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

function TemplateSingleSale(Id,Name,Photo,UrlKey,Profit,SelectedDate,Price,AveragePriceStockX,Sale,Site,Size){
    var ProfitLine = "" 
    var l = ""
    if(Site == ""){Site = "No Site"}
    AveragePriceStockX = AveragePriceStockX.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    (Profit >= 0) ? (ProfitLine = "success",l = "+ " + Valuta +"") : (ProfitLine = "danger",Profit *= -1, l = "- " + Valuta);
    console.log(ProfitLine)
    console.log(l)
    return `<tr id = "${Name}">` +
    "<td>" +
      "<div class='media align-items-center position-relative'><img class='rounded border border-200' src='"+ Photo +"' width='60' alt='' />" +
        "<div class='media-body ml-3'>" +
          "<h6 class='mb-1 font-weight-bold text-700' style='color:#fff !important;'>"+Name+"</h6>" +
          "<span class='badge badge rounded-capsule badge-soft-"+ProfitLine+"' style=cursor:pointer>" +
             l + "" + Profit + 
          "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +               
    "<td class='align-middle'>"+SelectedDate+"</td>" +
    "<td class='align-middle'>"+Site+"</td>" +
    "<td class='align-middle'>"+ Valuta +""+ Price+"</td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+ Valuta +""+ AveragePriceStockX+"</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+ Valuta +""+Sale+"</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+Size+"<span  data-fa-transform='shrink-2'></span></span></td>" +
    "<td></td>" +
    "<td class='align-middle'>" +
        "<button class='btn btn-falcon-default btn-sm' type='button' onclick='Delete("+Id+")'>" +
            "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
        "</button>" +
      "</td>" + 
  "</tr>"
}

function TemplateSingleSaleCustom(Id,Name,Photo,UrlKey,Profit,SelectedDate,Price,Sale,Site,Size){
    var ProfitLine = "" 
    var l = ""
    if(Site == ""){Site = "No Site"}
    //AveragePriceStockX = AveragePriceStockX.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    (Profit >= 0) ? (ProfitLine = "success",l = "+ " + Valuta) : (ProfitLine = "danger",Profit *= -1, l = "- " + Valuta);
    console.log(ProfitLine)
    console.log(l)
    return `<tr id = "${Name}">` +
    "<td>" +
      "<div class='media align-items-center position-relative'><img class='rounded border border-200' src='"+ Photo +"' width='60' alt='' />" +
        "<div class='media-body ml-3'>" +
          "<h6 class='mb-1 font-weight-bold text-700' style='color:#fff !important;'>"+Name+"</h6>" +
          "<span class='badge badge rounded-capsule badge-soft-"+ProfitLine+"' style=cursor:pointer>" +
             l + "" + Profit + 
          "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +               
    "<td class='align-middle'>"+SelectedDate+"</td>" +
    "<td class='align-middle'>"+Site+"</td>" +
    "<td class='align-middle'>"+ Valuta +""+Price+"</td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>€ ?</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+ Valuta +""+Sale+"</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+Size+"<span  data-fa-transform='shrink-2'></span></span></td>" +
    "<td></td>" +
    "<td class='align-middle'>" +
        "<button class='btn btn-falcon-default btn-sm' type='button' onclick='DeleteCustom("+Id+")'>" +
            "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
        "</button>" +
      "</td>" + 
  "</tr>"
}

function LoadSales(){
    document.getElementById("SalesTable").innerHTML = ""
    ipc.send("getUserId")
    ipc.on("ReturnedId",(event,arg) => {
        UserId = arg
        GetValutaAsUtf8(UserId)
        var Query = "SELECT * FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0 ORDER BY DataVendita DESC"
        connection.query(Query,UserId,function(error,results,fields){
            console.log(results)
            SalesList = results
            for(var Sale of SalesList){
                var Sold = TemplateSingleSale(
                    Sale.IdProdotto,
                    Sale.NomeProdotto,
                    Sale.ImmagineProdotto,
                    Sale.UrlKey,
                    Sale.Profitto,
                    FlipDateAndChange(Sale.DataVendita),
                    Sale.PrezzoProdotto,
                    Sale.PrezzoMedioResell,
                    Sale.PrezzoVendita,
                    Sale.Compratore,
                    Sale.Taglia)
                    $("#SalesTable").append(Sold)
            }
            //$("#Preloader1").css("display","none")
        })
        var Query = "SELECT * FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0 ORDER BY DataVendita DESC"
        connection.query(Query,UserId,function(error,results,fields){
            console.log(results)
            SalesListCustom = results
            for(var SaleCustom of SalesListCustom){
                var SoldCustom = TemplateSingleSaleCustom(
                    SaleCustom.IdProdotto,
                    SaleCustom.NomeProdotto,
                    SaleCustom.ImmagineProdotto,
                    SaleCustom.UrlKey,
                    SaleCustom.Profitto,
                    FlipDateAndChange(SaleCustom.DataVendita),
                    SaleCustom.PrezzoProdotto,
                    SaleCustom.PrezzoVendita,
                    SaleCustom.Compratore,
                    SaleCustom.Taglia)
                $("#SalesTable").append(SoldCustom)
            }
            Util.Profit(SalesList,SalesListCustom)
            Util.TotalSold(SalesList,SalesListCustom)
            Util.StockXItemsSold(SalesList)
            Util.CustomItemsSold(SalesListCustom)

        })
        $("#Preloader1").css("display","none")
    })
}

function Delete(Id){
    connection.query("DELETE FROM inventario WHERE IdProdotto = ?",Id,function(error,results,fields){
        if(error) console.log(error)
        CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
        location.reload()
    })
}

function DeleteCustom(Id){
    connection.query("DELETE FROM inventariocustom WHERE IdProdotto = ?",Id,function(error,results,fields){
        if(error) console.log(error)
        CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
        location.reload()
    })
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
    //console.log("Checking Connection")
}

ipc.on("CheckedConnection", (event,arg) =>{
    console.log(arg)
})

async function SyncAvgPrice(){
    $("#MessageSync").css("display","inline-block")
    var Array = []
    for(var Shoe of SalesList){
        Array.push({Id: Shoe.IdProdotto, Size: Shoe.Taglia, Url: Shoe.UrlKey})
    }
    console.log(Array)
    ipc.send("RequestedShoeDetailsArray",Array)
}

ipc.on("ReturnedProductDetailsArr",async function(event,arg){
    for(var ShoeToUpdate of arg){
        await EditPriceDeadStock(ShoeToUpdate.Id,ShoeToUpdate.Price)
    }
    location.reload()
})

async function EditPriceDeadStock(Id,Price){
    var Query = "UPDATE inventario SET PrezzoMedioResell = ? WHERE IdProdotto = ?"
    var Values = [Price,Id]
    await connection.query(Query,Values,function(error,fields,results){
        if(error) console.log(error)
        console.log("UPDATED")
    })
}

function Export(){
    ipc.send("RequestedExportInventorySold")
}