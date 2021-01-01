var mysql = require('mysql')
var path = require('path')
var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var pool = require('electron').remote.getGlobal('pool')
var SalesList = []
var SalesListCustom = [] 
var UserId = 0

var Util = require(path.join(__dirname,"/utilityScripts/query_stats_sales.js"))
var UserId = require('electron').remote.getGlobal('UserId')
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))

var Valuta = " "
GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    pool.getConnection(function(err,connection){
        if(err)console.log(err)
        connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",UserId,function(error,results,fileds){
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

function TemplateSingleSale(Id,Name,Site,Photo,UrlKey,Profit,SelectedDate,Price,AveragePriceStockX,Sale,Buyer,Size){
    var ProfitLine = "" 
    var l = ""
    if(Site == ""){Site = "No Site"}
    if(Buyer == ""){Buyer = "No Buyer"}
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
             l + "" + parseInt(Profit) + 
          "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +               
    "<td class='align-middle'>"+SelectedDate+"</td>" +
    "<td class='align-middle'>"+Site+"</td>" +
    "<td class='align-middle'>"+Buyer+"</td>" +
    "<td class='align-middle'>"+ Valuta +""+ parseInt(Price)+"</td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+ Valuta +""+ AveragePriceStockX+"</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+ Valuta +""+parseInt(Sale)+"</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+Size+"<span  data-fa-transform='shrink-2'></span></span></td>" +
    "<td></td>" +
    "<td class='align-middle'>" +
        "<button class='btn btn-falcon-default btn-sm' type='button' onclick='Delete("+Id+")'>" +
            "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
        "</button>" +
      "</td>" + 
  "</tr>"
}

function TemplateSingleSaleCustom(Id,Name,Site,Photo,UrlKey,Profit,SelectedDate,Price,Sale,Buyer,Size){
    var ProfitLine = "" 
    var l = ""
    if(Photo == "" || Photo == null){Photo = "img/InvEmpty.jpeg"}
    if(Site == ""){Site = "No Site"}
    if(Buyer == ""){Buyer = "No Buyer"}
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
             l + "" + parseInt(Profit) + 
          "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +               
    "<td class='align-middle'>"+SelectedDate+"</td>" +
    "<td class='align-middle'>"+Site+"</td>" +
    "<td class='align-middle'>"+Buyer+"</td>" +
    "<td class='align-middle'>"+ Valuta +""+parseInt(Price)+"</td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>€ ?</span></td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+ Valuta +""+parseInt(Sale)+"</span></td>" +
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
    pool.getConnection(function(err,connection){
        ipc.send("getUserId")
        ipc.on("ReturnedId",(event,arg) => {
            UserId = arg
            GetValutaAsUtf8(UserId)
            var Query = "SELECT * FROM inventario WHERE IdUtente = ? AND QuantitaAttuale = 0 ORDER BY DataVendita DESC"
            if(err)console.log(err)
            connection.query(Query,UserId,function(error,results,fields){
                console.log(results)
                SalesList = results
                var Query = "SELECT * FROM inventariocustom WHERE IdUtente = ? AND QuantitaAttuale = 0 ORDER BY DataVendita DESC"
                connection.query(Query,UserId,function(error,results,fields){
                    console.log(results)
                    SalesListCustom = results
                    LoadAll()
                    Util.Profit(SalesList,SalesListCustom)
                    Util.TotalSold(SalesList,SalesListCustom)
                    Util.StockXItemsSold(SalesList)
                    Util.CustomItemsSold(SalesListCustom)
                    $("#Preloader1").css("display","none")
                    connection.release()
                })
            })
        })
    })
}

function LoadAll(){
    console.log("Carico tutto")
    if(SalesList.length == 0 && SalesListCustom.length == 0){
        console.log("Liste vuote")
        //document.getElementById("TableSales").style.visibility = "hidden"
        document.getElementById("AlertSales").style.display = "inline-block"
    }else{
        console.log(SalesList)
        console.log(SalesListCustom)
        //document.getElementById("TableSales").style.visibility = "visible"
        document.getElementById("SalesHeader").style.display = "table-header-group"
        for(var Sale of SalesList){
            var Sold = TemplateSingleSale(
            Sale.IdProdotto,
            Sale.NomeProdotto,
            Sale.Sito,
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
        for(var SaleCustom of SalesListCustom){
            var SoldCustom = TemplateSingleSaleCustom(
                SaleCustom.IdProdotto,
                SaleCustom.NomeProdotto,
                SaleCustom.Sito,
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
    }
}

function Delete(Id){
    pool.getConnection(function(err,connection){
        connection.query("DELETE FROM inventario WHERE IdProdotto = ?",Id,function(error,results,fields){
            if(error) console.log(error)
            CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
            connection.release()
            location.reload()
        })
    })
}

function DeleteCustom(Id){
    pool.getConnection(function(err,connection){
        connection.query("DELETE FROM inventariocustom WHERE IdProdotto = ?",Id,function(error,results,fields){
            if(error) console.log(error)
            CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
            connection.release()
            location.reload()
        })
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
    pool.getConnection(async function(err,connection){
        await connection.query(Query,Values,function(error,fields,results){
            if(error) console.log(error)
            console.log("UPDATED")
            connection.release()
        })
    })
}

function Export(){
    ipc.send("RequestedExportInventorySold")
}