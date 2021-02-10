var mysql = require('mysql')
var path = require('path')
var moment = require('moment')
const { resolve } = require('path')
var config = require('electron').remote.getGlobal('configuration')
var JwtToken = require('electron').remote.getGlobal('JwtToken')
var Valuta = require('electron').remote.getGlobal('Valuta')
var Conversion = require('electron').remote.getGlobal('Conversion')
var SalesList = []
var SalesListCustom = [] 
var UserId = 0

var Util = require(path.join(__dirname,"/utilityScripts/query_stats_sales.js"))
var UserId = require('electron').remote.getGlobal('UserId')

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

async function LoadSales(){
    document.getElementById("SalesTable").innerHTML = ""
    ipc.send("getUserId")
    ipc.on("ReturnedId",async (event,arg) => {
        UserId = arg
        fetch("https://www.boringio.com:9003/GetSalesList",{
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
            SalesList = data.Results1
            SalesListCustom = data.Results2
            LoadAll()
            Util.Profit(SalesList,SalesListCustom)
            Util.TotalSold(SalesList,SalesListCustom)
            Util.StockXItemsSold(SalesList)
            Util.CustomItemsSold(SalesListCustom)
            $("#Preloader1").css("display","none")
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
    fetch("https://www.boringio.com:9003/DeleteSales",{
        method: 'POST',
        body: JSON.stringify({SalesId:Id}),
        headers: {
            'Content-Type': 'application/json',
            "Authorization": JwtToken
        },
        referrer: 'no-referrer'
    }).then(function (response) {
        console.log(response.status)
        if(response.ok){
          CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
          window.location.reload()
        } else {
            window.alert("Something went wrong, delete every tracking associated with this first")
        }
    }).then(async function(data){
        
    })
}

function DeleteCustom(Id){
    fetch("https://www.boringio.com:9003/DeleteSalesCustom",{
        method: 'POST',
        body: JSON.stringify({SalesId:Id}),
        headers: {
            'Content-Type': 'application/json',
            "Authorization": JwtToken
        },
        referrer: 'no-referrer'
    }).then(function (response) {
        console.log(response.status)
        if(response.ok){
          CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
          window.location.reload()
        } else {
          window.alert("Something went wrong, delete every tracking associated with this first")
        }
    }).then(async function(data){
        
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
    fetch("https://www.boringio.com:9003/EditPriceStockX",{
        method: 'POST',
        body: JSON.stringify({Price:Price,SalesId:Id}),
        headers: {
            'Content-Type': 'application/json',
            "Authorization": JwtToken
        },
        referrer: 'no-referrer'
    }).then(function (response) {
        console.log(response.status)
        if(response.ok){
          CreateLog("Deleted a pair of sold shoes","Sales","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
          window.location.reload()
        } else {
          window.alert("Something went wrong, delete every tracking associated with this first")
        }
    }).then(async function(data){
        
    })
}

function Export(){
    ipc.send("RequestedExportInventorySold")
}