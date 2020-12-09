var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var pool = require('electron').remote.getGlobal('pool')
console.log("All connections: " + pool._allConnections.length)
console.log("Free connections: " + pool._freeConnections.length)
console.log(pool)
var windowStats = require('electron').remote.getGlobal('windowStats')
var LatestAlert = require('electron').remote.getGlobal("AlertInventory")
var Valuta = require('electron').remote.getGlobal("ValutaAcc")
var https = require('https')
var http = require('http');
var path = require('path')
var Util = require(path.join(__dirname,"/utilityScripts/query_stats_inventory.js"))
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))
var UserId = require('electron').remote.getGlobal('UserId')
var UserAttachedInventory = require('electron').remote.getGlobal('UserIdAttached')

var ContSaved = 0

var Urls = []

if(UserAttachedInventory != null){
    UserId = UserAttachedInventory
}

var Conversion = 1
var Flag = false

console.log("User attached") 
console.log(UserAttachedInventory)

GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    if(Flag == false){
        console.log("Entrato nella funzione")
        Flag = true
        pool.getConnection(function(err,connection){
            connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
                if(error)console.log(error)
                console.log(results[0].Valuta1)
                Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
                console.log(Valuta)
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
                console.log("Coversione valuta")
                console.log(Conversion)
                connection.release()
                LoadShoes()
            })
        })
    }
}


function sleep(ms) {
    try{
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    catch(err){
      console.log(err)
    }
  }

SwitchAlert()

async function SwitchAlert(){
    if(LatestAlert != "No Alert Yet"){
        switch(LatestAlert){
            case "Add":
                $("#MessageAdd").css("display","inline-block")
                await sleep(5000)
                $("#MessageAdd").css("display","none")
                break;
            case "Delete":
                $("#MessageDelete").css("display","inline-block")
                await sleep(5000)
                $("#MessageDelete").css("display","none")
                break;
            case "Duplicate":
                $("#MessageDuplicate").css("display","inline-block")
                await sleep(5000)
                $("#MessageDuplicate").css("display","none")
                break;
            case "Sold":
                $("#MessageSale").css("display","inline-block")
                await sleep(5000)
                $("#MessageSale").css("display","none")
                break;
            case "Edit":
                $("#MessageEdit").css("display","inline-block")
                await sleep(5000)
                $("#MessageEdit").css("display","none")
                break;

            case "Export":
                $("#MessageExport").css("display","inline-block")
                await sleep(5000)
                $("#MessageExport").css("display","none")
                break;    
        }
        ipc.send("ResetAlert")
    }
}

function CreatePageStockX(url){
    ipc.send("WindowTracking","https://stockx.com/" + url)
}

function TemplateShoe(Id,ProductName,ReleaseDate,Site,Price,Value,Size,Photo,Url){
    if(Site == ""){Site = "No Site"}
    if(UserAttachedInventory != null){
        Value = Value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
        return `<tr id = "${ProductName}" >` +
        "<td>" +
        `<div class='media align-items-center position-relative'><img style = 'cursor: pointer;' class='rounded border border-200' src='${Photo}' width='60' alt='' onclick='CreatePageStockX("${Url}")'/>` +
        "<div class='media-body ml-3'>" +
        "<h6 class='mb-1 font-weight-semi-bold'>"+ ProductName +"</h6>" +
        "<span class='badge badge rounded-capsule badge-light mb-0'>" + ReleaseDate+ "</span>" +
        "</div>" +
    "</div>" +
    "</td>" +
        "<td class='align-middle font-weight-semi-bold'>?</td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Valuta + " ?</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Valuta + " ?</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+ Size +"<span  data-fa-transform='shrink-2'></span></span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEdit(" + Id +")'>" +
                "<span class='fas fa-pencil-alt' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareSale("+ Id +")'>" +
                "<span class='fas fa-tags' data-fa-transform='shrink-3 down-2'></span> " +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Duplicate("+ Id +")'>" +
                "<span class='fas fa-clone' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Delete("+ Id +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
    }else{
        Value = Value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
        return `<tr id = "${ProductName}" >` +
        "<td>" +
        `<div class='media align-items-center position-relative'><img style = 'cursor: pointer;' class='rounded border border-200' src='${Photo}' width='60' alt='' onclick='CreatePageStockX("${Url}")'/>` +
        "<div class='media-body ml-3'>" +
        "<h6 class='mb-1 font-weight-semi-bold'>"+ ProductName +"</h6>" +
        "<span class='badge badge rounded-capsule badge-light mb-0'>" + ReleaseDate+ "</span>" +
        "</div>" +
    "</div>" +
    "</td>" +
        "<td class='align-middle font-weight-semi-bold'>" + Site + "</td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Valuta + " " + Price +"</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Valuta + " " + parseFloat(Conversion * Value).toFixed(2) + "</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+ Size +"<span  data-fa-transform='shrink-2'></span></span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEdit(" + Id +")'>" +
                "<span class='fas fa-pencil-alt' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareSale("+ Id +")'>" +
                "<span class='fas fa-tags' data-fa-transform='shrink-3 down-2'></span> " +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Duplicate("+ Id +")'>" +
                "<span class='fas fa-clone' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Delete("+ Id +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
    }
}

function EditCustomImg(Id){
    $("#editCustomImg").modal('toggle')
    $("#IdToChangeImg").val(Id)
}

function ChangedImg(){
    var ImgUrl = $("#prodImgCustomToEdit").val()
    var IdCustomToChange = $("#IdToChangeImg").val()
    console.log("New url")
    console.log(ImgUrl)
    console.log("Id")
    console.log(IdCustomToChange)
    pool.getConnection(function(err,connection){
        connection.query("UPDATE inventariocustom SET ImmagineProdotto = ? WHERE IdProdotto = ?",[ImgUrl,IdCustomToChange],function(error,results,fields){
            if(error)console.log(error)
            connection.release()
            location.reload()
        })
    })
}

function TemplateShoeCustom(Id,ProductName,ReleaseDate,Site,Price,Size,Photo){
    if(Site == ""){Site = "No Site"}
    if(UserAttachedInventory != null){
        return `<tr id = "${ProductName}" >` +
        "<td>" +
        "<div class='media align-items-center position-relative' onclick='EditCustomImg(" + Id +")'><img style = 'cursor: pointer;' class='rounded border border-200' src='"+Photo+"' width='60' alt=''/>" +
            "<div class='media-body ml-3'>" +
            "<h6 class='mb-1 font-weight-semi-bold'>"+ ProductName +"</h6>" +
            "<span class='badge badge rounded-capsule badge-light mb-0'>" + ReleaseDate+ "</span>" +
            "</div>" +
        "</div>" +
        "</td>" +
        "<td class='align-middle font-weight-semi-bold'> ? </td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Valuta + " ?</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Valuta + " ?</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+ Size +"<span data-fa-transform='shrink-2'></span></span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEditCustom(" + Id +")'>" +
                "<span class='fas fa-pencil-alt' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareSaleCustom("+ Id +")'>" +
                "<span class='fas fa-tags' data-fa-transform='shrink-3 down-2'></span> " +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'DuplicateCustom("+ Id +")'>" +
                "<span class='fas fa-clone' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'DeleteCustom("+ Id +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
    }else{
        return `<tr id = "${ProductName}" >` +
        "<td>" +
            "<div class='media align-items-center position-relative' onclick='EditCustomImg(" + Id +")'><img style = 'cursor: pointer;' class='rounded border border-200' src='"+Photo+"' width='60' alt=''/>" +
            "<div class='media-body ml-3'>" +
            "<h6 class='mb-1 font-weight-semi-bold'>"+ ProductName +"</h6>" +
            "<span class='badge badge rounded-capsule badge-light mb-0'>" + ReleaseDate+ "</span>" +
            "</div>" +
        "</div>" +
        "</td>" +
        "<td class='align-middle font-weight-semi-bold'>"+ Site +"</td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Valuta + " " + Price + "</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Valuta + " " +"?</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>"+ Size +"<span  data-fa-transform='shrink-2'></span></span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEditCustom(" + Id +")'>" +
                "<span class='fas fa-pencil-alt' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareSaleCustom("+ Id +")'>" +
                "<span class='fas fa-tags' data-fa-transform='shrink-3 down-2'></span> " +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'DuplicateCustom("+ Id +")'>" +
                "<span class='fas fa-clone' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'DeleteCustom("+ Id +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
    }
}

var ShoesList = []
var CustomList = []
var Index = 0
var timer
var GlobalProducts = []
var i = 0

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

/*$(document).ready(() => {
    LoadShoes()
})*/

function Searching(){
    var ShoesToSearch = $('#newShoe');
    ipc.send("SearchProducts",ShoesToSearch.val())
}

function FlipDate(date){
    var date1 = date.split('-')
    return date1[2]+"/"+date1[1]+"/"+date1[0]
}

function GetTodaysDate(){
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear()
    today = yyyy + '/' + mm + '/' + dd;
    return today
}

function GetTodaysDateDashFormat(){
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd;
    return today
}

function GenerateRandomNumber(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

ipc.on("ReturnedProducts",async (event,arg) => {
    console.log(arg)
    PrintSearchedProducts(arg)
})

ipc.on("ReturnedProductDetailsServer", async(event,arg) => {
    arg = JSON.parse(arg)
    windowStats.webContents.send("fillVariantStats",arg)
    for(var Variant of arg.variants){
        console.log(Variant)
        document.getElementById("prodSize").innerHTML += "<option value = '"+Variant.market.averageDeadstockPrice+"'>"+Variant.size+"</option>"
    }
})

$("#new").on("hidden.bs.modal",() => {
    //ClearModal()
    //windowStats.webContents.send("close")
})

/*function ClearModal(){
    $("input").val("")
    document.getElementById("productsScraped").innerHTML = "<option value = 'NoProd'>No products searched</option>"
}*/

function PrintSearchedProducts(Products){
    GlobalProducts = Products
    var c = 1
    for(var Prod of Products){
        $("#Img" + c).attr("src",Prod.media.imageUrl)
        $("#Name" + c).text(Prod.name)
        $("#Div" + c).show()
        console.log(Prod.name)
        console.log(Prod.url)
        Urls[c] = Prod.url
        c+=1
    }
    $("#Div1").on("click",() => {LoadShoesModal(Urls[1])})
    $("#Div2").on("click",() => {LoadShoesModal(Urls[2])})
    $("#Div3").on("click",() => {LoadShoesModal(Urls[3])})
    $("#Div4").on("click",() => {LoadShoesModal(Urls[4])})
    $("#Div5").on("click",() => {LoadShoesModal(Urls[5])})
    $("#ShoesList").show()
}
var SavedProd = []
var ReadyToAdd = []

function SingleSavedShoe(Url,Img,Name,Price,Date,ActualCont){
    return `<div class="col-md-6 col-lg-12" >` +
    `<img class="card-img-top"/>`+ 
    `<div id='DivShoe${ActualCont}' class='card-body' style='background-color: #132238;border-radius: 4px;cursor: pointer;'>` +
    "<div class='row justify-content-between align-items-center'>" +
      "<div class='col'>" +
        "<div class='media'>" +
          "<div class='mr-2'>" +
          `<img id = 'ImgSingle${ActualCont}' src='${Img}' style='width: 64px;border-radius: .25rem !important;'>` +
          "</div>" +
          "<div class='media-body fs--1'>" +
            `<input type='hidden' id='UrlSingle${ActualCont}' value='${Url}'>` +
            `<input type='hidden' id='Value${ActualCont}'>` +
            `<input type='hidden' id='NameSingle${ActualCont}'>` +
            "<h6 class='fs-0'>"+Name+" &nbsp&nbsp</h6>" + 
            "<br>" +
            "<span id='BadgeSize"+ActualCont +"' class='badge badge rounded-capsule badge-soft-success'>?</span>" +
            "&nbsp<span id='BadgeDate"+ActualCont +"' class='badge badge rounded-capsule badge-soft-warning'>"+Date+"</span>" +
            "&nbsp<span id='BadgePrice"+ActualCont +"' class='badge badge rounded-capsule badge-soft-info'>$"+Price+"</span>" +
            "&nbsp<span id='BadgeSite"+ActualCont +"' class='badge badge rounded-capsule badge-soft-dark'>?</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
      "<div class='col-md-auto mt-4 mt-md-0'>" +
      `<button id='Edit${ActualCont}' onclick = 'OpenEdit(${ActualCont})'class='btn btn-info btn-sm mr-2' style='background-color: #6C63FF !important;color: #fff;border: none;' type='button' data-toggle='collapse' data-target='#collapseSingleShoe${ActualCont}' aria-expanded='false' aria-controls='collapseSingleShoe'>Edit</button>` +
      `<button id='Remove${ActualCont}' onclick = 'RemoveSaved(${ActualCont})' class='btn btn-info btn-sm mr-2' style='background-color: #e63757 !important;color: #fff;border: none;' type='button'>Remove</button>` +
      `<button id='Save${ActualCont}' onclick= 'Save(${ActualCont})'class='btn btn-info btn-sm mr-2' style='background-color: #00d27a !important;color: #fff;border: none;' type='button'>Save</button>` +
      `<span id='Green${ActualCont}' style="color:#00d27a;" class="fas fa-check" data-fa-transform="shrink-3 down-2"></span>`+
      `<span id='Red${ActualCont}' style="color:#e63757;" class="fas fa-exclamation" data-fa-transform="shrink-3 down-2"></span>`+  
      "</div>" +
      "<div class='form-row collapse' id='collapseSingleShoe"+ActualCont+"' style='padding-top: 20px'>" +                       
        "<div class='form-group col-3'>" +
          "<label for='modal-auth-password'>Size</label>" +
          "<select class='form-control' type='text' id = 'prodSize"+ActualCont+"' ></select>" +
        "</div>" +
        "<div class='form-group col-3'>" +
          "<label for='modal-auth-password'>Date</label>" +
          "<input class='form-control datetimepicker' id='prodDate"+ActualCont+"' type='text' data-options='{'dateFormat':'d/m/Y'}' />" +
        "</div>" +
        "<div class='form-group col-3'>" +
          "<label for='modal-auth-password'>Price</label>" + 
          "<input class='form-control' type='text' id = 'prodPrice"+ActualCont+"' />" +
        "</div>" +
        "<div class='form-group col-3'>" + 
          "<label for='modal-auth-password'>Site</label>" +
          "<input class='form-control' type='text'  id = 'prodSite"+ActualCont+"'/>" +
        "</div>" + 
        "<div class='col-12' style = 'margin-left:5px;color:#e63757;' id='prodError"+ActualCont+"'>" + 
        "</div>" +
      "</div>" +  
    "</div>" +
  "</div>" +
  "</div>"
}

ipc.on("ReturnedProductDetails", async(event,arg) => {
    for(var Variant of arg.Prod.variants){
        console.log(Variant)
        document.getElementById("prodSize"+arg.Index).innerHTML += "<option value = '"+Variant.market.averageDeadstockPrice+"'>"+Variant.size+"</option>"
    }
    console.log("Size selezionata")
    console.log(arg.Prod.variants[0].size)
    $("#BadgeSize"+arg.Index).text(arg.Prod.variants[0].size)
    $("#BadgeSite"+arg.Index).text("No Site")
    $("#Value"+arg.Index).val(arg.Prod.variants[0].market.averageDeadstockPrice)
    ReadyToAdd[arg.Index] = true
})

function ClearResearch(){
    GlobalProducts = []
    $("#ShoesList").hide()
    for(var k = 1; k < 6; k+=1){
        $("#Div"+k).off("click")
    }
    $("#newShoe").text("")
    $("#newShoe").val("")
}

function RemoveSaved(Cont){
    SavedProd[Cont] = []
    ReadyToAdd[Cont] = false
    $("#DivShoe"+Cont).remove()
}

function OpenEdit(Cont){
    $("#Edit" + Cont).hide()
    $("#Remove" + Cont).hide()
    $("#Save" + Cont).show()
}

function Save(Cont){
    if($("#prodPrice"+Cont).val() == ""){
        $("#Red"+Cont).show() 
        $("#Green"+Cont).hide()
        console.log("Il prezzo è vuoto")
        ReadyToAdd[Cont] = false
        $("#prodError"+Cont).text("The field 'Price' cannot be empty")
    }else{
        if(isNaN($("#prodPrice"+Cont).val())){
            $("#Red"+Cont).show() 
            $("#Green"+Cont).hide()
            console.log("Il prezzo non è un numero")
            ReadyToAdd[Cont] = false
            $("#prodError"+Cont).text("The field 'Price' must be a number")
        }else{
            if($("#prodSize"+Cont).val() == ""){
                $("#Red"+Cont).show()
                $("#Green"+Cont).hide()
                console.log("Deve esserci una taglia")
                ReadyToAdd[Cont] = false
                $("#prodError"+Cont).text("The field 'Size' need to be selected")
            }else{
                if(CheckValidDate($("#prodDate"+Cont).val())){
                    $("#BadgePrice"+ Cont).text("$ " + $("#prodPrice" + Cont).val())
                    $("#BadgeSite"+ Cont).text($("#prodSite" + Cont).val())
                    $("#BadgeSize"+ Cont).text($("#prodSize"+Cont +" option:selected").text())
                    $("#Value"+ Cont).text($("prodSize"+ Cont).val())
                    $("#BadgeDate"+ Cont).text($("#prodDate" + Cont).val())
                    $("#Green"+Cont).show()
                    $("#Red"+Cont).hide()
                    ReadyToAdd[Cont] = true
                    $("#collapseSingleShoe"+Cont).collapse("hide")
                    $("#Edit" + Cont).show()
                    $("#Remove" + Cont).show()
                    $("#Save" + Cont).hide()
                }else{
                    $("#Red"+Cont).show()
                    $("#Green"+Cont).hide()
                    console.log("Wrong date format")
                    ReadyToAdd[Cont] = false
                    $("#prodError"+Cont).text("The field 'Date' need to be in the correct format (dd/mm/yyyy)")
                }
            }
        }  
    }   
}
function CheckValidDate(Date){
    try{
        var Splitted = Date.split("/")
        if((Splitted[0].length == 2 || Splitted[0].length == 1) && (Splitted[0] != "0" && Splitted[1] != "0")){
            if((Splitted[1].length == 2 || Splitted[1].length == 2) && (Splitted[0] != "00" && Splitted[1] != "00")){
                if(Splitted[2].length == 4 && Splitted[0] != "0"){
                    return true
                }
                return false
            }
            return false
        }
        return false
    }catch(err){
        return false
    }
}

var LoadShoesModal = function(SelectedUrl){
    console.log("Hai selezionato: " + SelectedUrl)
    var ProductChosen = SelectedUrl
    if(ProductChosen != "" && ProductChosen != false){
        ipc.send("RequestedShoeDetails",{Prod: ProductChosen,Index: ContSaved})
        var SelectedProd = GlobalProducts.filter(function(prod){
            return prod.url == ProductChosen
        })
        console.log("Selected product")
        console.log(SelectedProd[0])
        var ShoeToSave = SingleSavedShoe(SelectedUrl,SelectedProd[0].media.imageUrl,SelectedProd[0].name,SelectedProd[0].searchable_traits["Retail Price"],FlipDate(SelectedProd[0].release_date),ContSaved)
        $("#ContainerSaved").append(ShoeToSave)
        $("#Save"+ContSaved).hide()
        $("#prodPrice"+ContSaved).val(SelectedProd[0].searchable_traits["Retail Price"])
        $("#prodDate"+ContSaved).val(FlipDate(SelectedProd[0].release_date))
        $("#prodSite"+ContSaved).val("No site")
        $("#NameSingle"+ContSaved).val(SelectedProd[0].name)
        $("#Red"+ContSaved).hide()
        SavedProd.push(SelectedProd[0])
        ClearResearch()
        ContSaved+=1
    }
}

function SearchNewShoes(){
    clearTimeout(timer)
    timer = setTimeout(Searching, 600)
}

function LoadShoes(){
    Index = 0
    pool.getConnection(function(err,connection){
        connection.query("SELECT * FROM inventario WHERE IdUtente like ? AND QuantitaAttuale = 1 ORDER BY DataAggiunta DESC",UserId,  function (error, results, fields) {
            if(error) {console.log(error);$("#MessageError").css("display","inline-block")}
            ShoesList = results
            console.log(ShoesList)
            //PopulateTable()
            Util.StockXItems(ShoesList,Valuta)
            connection.query("SELECT * FROM inventariocustom WHERE IdUtente like ? AND QuantitaAttuale = 1 ORDER BY DataAggiunta DESC",UserId,  function (error, results, fields) {
                if(error) {console.log(error);$("#MessageError").css("display","inline-block")}
                CustomList = results
                console.log(CustomList)
                //PopulateTableCustom()
                Util.CustomItems(CustomList,Valuta)
                Util.Retail(ShoesList,CustomList,Valuta)
                Util.Average(ShoesList,Valuta)
                Populate()
                connection.release()
            })
        })
    })
    console.log("Loaded")
}
/* UTILITY METHODS */
function FlipDateAndChange(DateToChange){
    return moment(DateToChange).format('DD[/]MM[/]YYYY')
}

function ChangeDate(DateToChange){
    return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

function ReturnObjectFromList(Id){
    for(var i = 0; i < ShoesList.length; i++){
        if(ShoesList[i].IdProdotto == Id){
            return ShoesList[i]
        }
    }
}
/*<div class='center'>
<img src='https://i.ibb.co/kKmwkJW/superscene-69-box-removebg-preview.png' alt=''>
<h3 style='margin-top: -40px;'>Oh no! It's empty</h3> <br>
<p style='margin-top: -20px;'>Start to add something</p>
</div>
*/
function Populate(){
    var Inventario = document.getElementById("Inventory")
    Inventario.innerHTML = ""
    if(ShoesList.length == 0 && CustomList.length == 0){
        document.getElementById("TableInventory").style.display = "none"
        document.getElementById("AlertNoItem").style.display = "inline-block"
        $("#Preloader1").css("display","none")
    }else{
        document.getElementById("TableInventory").style.display = "table-header-group"
        //document.getElementById("AlertNoItem").style.visibility="hidden"
        for(var Shoe of ShoesList){
            var NewDate = FlipDateAndChange(Shoe.ReleaseDate)
            var Shoe = TemplateShoe(Shoe.IdProdotto,Shoe.NomeProdotto,NewDate,Shoe.Sito,Shoe.PrezzoProdotto,Shoe.PrezzoMedioResell,Shoe.Taglia,Shoe.ImmagineProdotto,Shoe.UrlKey)
            $("#Inventory").append(Shoe)
        }
        for(var CustomObj of CustomList){
            var NewDate = FlipDateAndChange(CustomObj.ReleaseDate)
            var Custom = TemplateShoeCustom(CustomObj.IdProdotto,CustomObj.NomeProdotto,NewDate,CustomObj.Sito,CustomObj.PrezzoProdotto,CustomObj.Taglia,CustomObj.ImmagineProdotto)
            $("#Inventory").append(Custom)    
        }
        $("#Preloader1").css("display","none")
    }
}


function PopulateTable(){
    var Inventario = document.getElementById("Inventory")
    Inventario.innerHTML = ""
    for(var Shoe of ShoesList){
        var NewDate = FlipDateAndChange(Shoe.ReleaseDate)
        var Shoe = TemplateShoe(Shoe.IdProdotto,Shoe.NomeProdotto,NewDate,Shoe.Sito,Shoe.PrezzoProdotto,Shoe.PrezzoMedioResell,Shoe.Taglia,Shoe.ImmagineProdotto,Shoe.UrlKey)
        $("#Inventory").append(Shoe)    
    }
    //$("#Preloader1").css("display","none")
}
function PopulateTableCustom(){
    for(var CustomObj of CustomList){
        var NewDate = FlipDateAndChange(CustomObj.ReleaseDate)
        var Custom = TemplateShoeCustom(CustomObj.IdProdotto,CustomObj.NomeProdotto,NewDate,CustomObj.Sito,CustomObj.PrezzoProdotto,CustomObj.Taglia,CustomObj.ImmagineProdotto)
        $("#Inventory").append(Custom)    
    }
    $("#Preloader1").css("display","none")
}

function getRndInteger() {
    return Math.floor(Math.random() * (9999999, - 1000000 + 1) ) + 1000000;
}

async function SendMultipleToDB(){
    var Values = []
    var QueryDone = 0
    var QueryReady = 0
    for(var k = 0; k < ContSaved; k+=1){
        if(ReadyToAdd[k] == true){
            QueryReady +=1
        }
    }
    console.log(ReadyToAdd)
    for(var k = 0; k < ContSaved; k+=1){
        console.log("Nuovo ciclo")
        if(ReadyToAdd[k] == true){
            var Pid = getRndInteger()
            var Name = $("#NameSingle" + k).val()
            var D = $("#BadgeDate" + k).text().split("/")
            var DateAdd = `${D[2]}-${D[1]}-${D[0]}`
            var Size = $("#BadgeSize" + k).text()
            var Value = $("#Value" + k).val()
            console.log(Value)
            var Price = parseFloat($("#BadgePrice" + k).text().replace('$',''))
            var Site = $("#BadgeSite" + k).text()
            var Img = $("#ImgSingle" + k).attr("src")
            console.log(Img)
            var Url = $("#UrlSingle" + k).val()
            var Prof = 0 - parseFloat($("#BadgePrice" + k).text().replace('$',''))
            var Today = GetTodaysDate()
            var Notes = ""
            var SingleQuery = [
                Pid,Name,DateAdd,Price,Size,1,1,Site,"",Img,Url,parseInt(Value),0,Prof,Notes,Today,0,UserId
            ]
            Values.push(SingleQuery)
            CreateLog(`Added a pair of ${Name}`,"Inventory","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
        }
    }
    var Query = ("INSERT INTO inventario (PidProdotto,NomeProdotto,ReleaseDate,PrezzoProdotto,Taglia,QuantitaTotale,QuantitaAttuale,Sito,Compratore,ImmagineProdotto,UrlKey,PrezzoMedioResell,PrezzoVendita,Profitto,Note,DataAggiunta,IdConto,IdUtente) values ?")
    console.log(Values)
    pool.getConnection(async function(err,connection){
        connection.query(Query,[Values],function(error,results,fields){
            if(err)console.log(err)
            connection.release()
            location.reload()
        })
    })
}

/*async function SendToDb(Query,Values,QueryDone,QueryReady,Name){
    await pool.getConnection(async function(err,connection){
        await connection.query(Query,Values,function(error,results,fields){
            if(error)console.log(error)
            console.log("Fatto")
            CreateLog(`Added a pair of ${Name}`,"Inventory","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
            connection.release()
            //QueryDone+=1
            if(QueryDone == QueryReady){
                location.reload()
            }
            return true
        })
    })
}*/


/*function Add(){
    var Notes = ""
    if($("#prodNotes").val() == ""){ Notes = "No notes"}else{ Notes = $("#prodNotes").val()}
    var DateToAdd = ""
    if($("#wizard-datepicker").val() != ""){
        var FlippedDate = $("#wizard-datepicker").val().split('/')
        DateToAdd = FlippedDate[2] +"-"+FlippedDate[1]+"-"+FlippedDate[0]
    }else{
        DateToAdd = GetTodaysDateDashFormat()
    }
    var Query = ("INSERT INTO inventario (PidProdotto,NomeProdotto,ReleaseDate,PrezzoProdotto,Taglia,QuantitaTotale,QuantitaAttuale,Sito,Compratore,ImmagineProdotto,UrlKey,PrezzoMedioResell,PrezzoVendita,Profitto,Note,DataAggiunta,IdConto,IdUtente) values (?)")
    var Values = [
        [
            $("#prodPid").val(),$("#prodName").val(),DateToAdd,parseFloat($("#prodPrice").val()),$("#prodSize option:selected").text(),1,1,
            $("#prodSite").val(),"",$("#prodImg").val(),$("#prodUrl").val(),parseInt($("#prodSize option:selected").val()),0,0 - $("#prodPrice").val(),Notes,
            GetTodaysDate(),0,UserId
        ]
    ]
    console.log(Values)
    var Res = CheckValuesBeforeAdd(Values)
    if(Res == true){
        console.log(Values)
        pool.getConnection(function(err,connection){
            connection.query(Query,Values,function(error,results,fields){
                if(error) console.log(error)
                CreateLog(`Added a pair of ${$("#prodName").val()}`,"Inventory","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
                ipc.send("SetAlert","Add")
                connection.release()
                location.reload()
            })
        })
    }else{
        ErrorCreation("errorLabel",Res)
    }
}*/

function Delete(IdDelete){
    console.log(IdDelete)
    var NameProdDeleted = ""
    for(var Shoe of ShoesList){
        if(Shoe.IdProdotto == IdDelete){
            console.log("Trovato")
            NameProdDeleted = Shoe.NomeProdotto
        }
    }
    console.log(NameProdDeleted)
    pool.getConnection(function(err,connection){
        connection.query("DELETE FROM inventario WHERE IdProdotto = ?",IdDelete,function (error,results,fields){
            if(error) throw error
            CreateLog(`Deleted a pair of ${NameProdDeleted}`,"Inventory","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
            ipc.send("SetAlert","Delete")
            connection.release()
            location.reload()
        })
    })
}


function Duplicate(Id){
    var Query = "INSERT INTO inventario (PidProdotto,NomeProdotto,ReleaseDate,PrezzoProdotto,Taglia,QuantitaTotale,QuantitaAttuale,Sito,Compratore,ImmagineProdotto,UrlKey,PrezzoMedioResell,PrezzoVendita,Profitto,Note,DataAggiunta,IdConto,IdUtente) values ?"
    console.log("Duplicated")
    var ShoeToDuplicate = ReturnObjectFromList(Id)
    console.log(ShoeToDuplicate)
    var S = Object.values(ShoeToDuplicate)
    console.log(S)
    var Today = moment().format('YYYY[-]MM[-]DD')
    var Values = [
        [S[1],S[2],ChangeDate(S[3]),S[4],S[5],1,1,S[8],S[9],S[12],S[13],S[14],0,-S[4],S[18],Today,S[21],S[22]]
    ]
    pool.getConnection(function(err,connection){
        connection.query(Query,[Values],function(error,results,fields){
            if(error) throw error
            CreateLog(`Duplicated a pair of ${ShoeToDuplicate.NomeProdotto}`,"Inventory","Duplicate",moment().format('MMMM Do YYYY, h:mm:ss a'))
            ipc.send("SetAlert","Duplicate")
            connection.release()
            location.reload()
        })
    })
}


function PrepareSale(Id){
    $("#sale").modal('toggle')
    console.log(Id)
    document.getElementById("IdToSell").value = Id
    var SelectedShoe = ShoesList.filter((e) => {
        return e.IdProdotto == Id
    })
    console.log(SelectedShoe)
    document.getElementById("prodPriceSale").value = SelectedShoe[0].PrezzoProdotto
}

function SaleShoe(){
    var ProdId = $("#IdToSell").val()
    var NameProdDeleted = ""
    for(var Shoe of ShoesList){
        if(Shoe.IdProdotto == ProdId){
            console.log("Trovato")
            NameProdDeleted = Shoe.NomeProdotto
        }
    }
    var ProdPrice = $("#prodPriceSale").val()
    var ProdPriceSell = $("#prodPriceSell").val()
    var ProdSite = $("#prodSiteSell").val()
    var DateSale
    var App
    ($("#wizard-datepicker1").val()) ? (App = $("#wizard-datepicker1").val().split("/"),DateSale = App[2] + "-" + App[1] + "-" + App[0]) : DateSale = GetTodaysDateDashFormat()
    console.log("Sito")
    console.log(ProdSite)
    console.log("Data")
    console.log(DateSale)
    var Prof = ProdPriceSell - ProdPrice
    var Query = "UPDATE inventario SET Profitto = ?,QuantitaAttuale = ?,Compratore = ?,immagineCompratore = ?,FlagComprata = ?,PrezzoVendita = ?,DataVendita = ? WHERE IdProdotto like ?"
    var Values = [Prof,0,ProdSite,"No Img",1,ProdPriceSell,DateSale,ProdId]
    var Res = CheckValuesBeforeSale(Values)
    if(Res == true){
        console.log(Values)
        pool.getConnection(function(err,connection){
            connection.query(Query,Values,function(error,results,fields){
                if(error) console.log(error)
                CreateLog(`Sold a pair of ${NameProdDeleted}`,"Bot","Sold",moment().format('MMMM Do YYYY, h:mm:ss a'))
                ipc.send("SetAlert","Sold")
                connection.release()
                location.reload()
            })
        })
    }else{
        console.log(Res)
        ErrorCreation("errorLabelSale",Res)
    }
}


function PrepareEdit(Id){
    var ShoeToModify = ShoesList.filter(function(e){
        return e.IdProdotto == Id
    })
    $("#IdToModify").val(Id)
    $("#PriceToModify").val(ShoeToModify[0].PrezzoProdotto)
    $("#wizard-datepicker2").val(FlipDateAndChange(ShoeToModify[0].ReleaseDate))
    $("#NotesToModify").val(ShoeToModify[0].Note)
    $("#SiteToModify").val(ShoeToModify[0].Sito)

    ipc.send("RequestedShoeDetailsEdit",ShoeToModify[0].UrlKey)
    ipc.on("ReturnedProductDetailsForEdit",async (event,arg) => {
        for(var Variant of arg.variants){
            document.getElementById("SizeToModify").innerHTML += "<option value = '"+Variant.market.averageDeadstockPrice+"'>"+Variant.size+"</option>"
        }
        $("#modifica").modal("toggle")
        $("#SizeToModify > option").each(function() {
            console.log(this.text + ' ' + this.value);
            if(this.text == ShoeToModify[0].Taglia){
                $(this).attr("selected","true")
            }
        });
    })
}


function Edit(Id){
    var Id = $("#IdToModify").val()
    var NameProdEdited = ""
    for(var Shoe of ShoesList){
        if(Shoe.IdProdotto == Id){
            console.log("Trovato")
            NameProdEdited = Shoe.NomeProdotto
        }
    }

    var PrezzoProdotto = $("#PriceToModify").val()
    var D = $("#wizard-datepicker2").val().split('/')
    var ReleaseDate = D[2] + "-" + D[1] + "-" + D[0]
    var Taglia = $("#SizeToModify option:selected").text()
    var AvgPrice = $("#SizeToModify option:selected").val()
    var Site = $("#SiteToModify").val()
    var Note = $("#NotesToModify").val()
    var Query = "UPDATE inventario SET PrezzoProdotto = ?, ReleaseDate = ?, Taglia = ?,Sito = ?,Note = ?, PrezzoMedioResell = ?,Profitto = ? WHERE IdProdotto = ?"
    var Values = [PrezzoProdotto,ReleaseDate,Taglia,Site,Note,AvgPrice,0 - PrezzoProdotto,Id]
    pool.getConnection(function(err,connection){
        connection.query(Query,Values,function(err,results,fields){
            if(err)console.log(err)
            console.log("Edited")
            CreateLog(`Edited a pair of ${NameProdEdited}`,"Inventory","Edit",moment().format('MMMM Do YYYY, h:mm:ss a'))
            ipc.send("SetAlert","Edit")
            connection.release()
            location.reload()
        })
    })
}

function ErrorCreation(target, message){
    document.getElementById(target).innerHTML = message
}

/*FUNCTION FOR CHECKING THE VALUES FOR THE ADD*/
function CheckValuesBeforeAdd(List){
    var ErrorCreated = ""
    console.log(List[0][3])
    if(List[0][1] == "" || List[0][1] == undefined) {ErrorCreated = "You need to select a product before continue"; return ErrorCreated}
    if(isNaN(List[0][3])) {ErrorCreated = "The field 'Price' must be a number"; return ErrorCreated}
    if(List[0][7].length > 40){ErrorCreated = "The field 'Site' must be shorter than 40 characters"; return ErrorCreated}
    if(List[0][14].length > 200){ErrorCreated = "The field 'Notes' must be shorter than 200 characters"; return ErrorCreated}
    return true
}

/*FUNCTION FOR CHECKING THE VALUES FOR THE SALE*/

function CheckValuesBeforeSale(List){
    console.log(List)
    var ErrorCreated = "";
    if(isNaN(List[5])){ ErrorCreated = "The field 'Price' must be a number"; return ErrorCreated}
    if(List[5].length == 0){ErrorCreated = "The field 'Price' cannot be empty"; return ErrorCreated}
    if(List[2].length > 40){ ErrorCreated = "The field 'Site' must be shorter than 40 characters"; return ErrorCreated}
    return true
}

/*FUNCTION FOR CHECKING THE VALUES FOR THE EDIT*/


function CreateLog(Mess,Sec,Act,DateTime){
    var ObjTosend = {
      Message: Mess,
      Section: Sec,
      Action: Act,
      DateTime: DateTime
    }
    ipc.send("CreateLog",ObjTosend)
}

async function SyncAvgPrice(){
    $("#MessageSync").css("display","inline-block")
    var Array = []
    for(var Shoe of ShoesList){
        Array.push({Id: Shoe.IdProdotto, Size: Shoe.Taglia, Url: Shoe.UrlKey})
    }
    console.log(Array)
    ipc.send("RequestedShoeDetailsArray",Array)
}

ipc.on("ReturnedProductDetailsArr",async function(event,arg){
    console.log("Returned Product new Array")
    console.log(arg)
    for(var ShoeToUpdate of arg){
        await EditPriceDeadStock(ShoeToUpdate.Id,ShoeToUpdate.Price)
    }
    location.reload()
})

async function EditPriceDeadStock(Id,Price){
    var Query = "UPDATE inventario SET PrezzoMedioResell = ? WHERE IdProdotto = ?"
    var Values = [Price,Id]
    await pool.getConnection(async function(err,connection){
        await connection.query(Query,Values,function(error,fields,results){ 
            if(error) console.log(error)
            connection.release()
            console.log("UPDATED")
        })
    })
}

ipc.on("NewSyncReceived",(event,arg)=>{
    console.log("Sincronizzando nr",arg)
    $("#MessageSync").text("Syncronizing nr " + arg)
})

function LogOut(){
    ipc.send("LogOut")
}

function CheckConnection(){
    ipc.send("CheckConnection")
}

ipc.on("CheckedConnection", (event,arg) =>{
    console.log(arg)
})

async function Export(){
    ipc.send("RequestedExportInventory")
    await sleep(500)
    ipc.send("SetAlert","Export")
    //location.reload()
}

/* CUSTOM SECTION */

function AddCustom(){
    var Name = $("#newShoeCustom").val()
    var Price = $("#prodPriceCustom").val()
    var Res = CheckValuesBeforeAddCustom(Price,Name)
    var Size = $("#prodSizeCustom").val()
    var Site = $("#prodSiteCustom").val()
    var Notes = $("#prodNotesCustom").val()
    var UrlImg = $("#prodImgCustom").val()
    var DateToAdd = ""
    if($("#prodDateCustom").val() != ""){
        var FlippedDate = $("#prodDateCustom").val().split('/')
        DateToAdd = FlippedDate[2] +"-"+FlippedDate[1]+"-"+FlippedDate[0]
    }else{
        DateToAdd = GetTodaysDateDashFormat()
    }
    if(Res == true){
        var Query = "INSERT INTO inventariocustom (NomeProdotto,ReleaseDate,PrezzoProdotto,Taglia,QuantitaTotale,QuantitaAttuale,Sito,Compratore,ImmagineProdotto,PrezzoVendita,Profitto,Note,DataAggiunta,IdConto,IdUtente) values (?)"
        var Values = [
            [Name,DateToAdd,Price,Size,1,1,Site,"",UrlImg,0,-Price,Notes,GetTodaysDateDashFormat(),0,UserId]
        ]
        pool.getConnection(function(err,connection){
            connection.query(Query,Values,function(error,results,fields){
                if(error) console.log(error)
                CreateLog(`Added ${$("#newShoeCustom").val()}`,"Inventory","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
                ipc.send("SetAlert","Add")
                connection.release()
                location.reload()
            })
        })
    }else{
        ErrorCreation("errorLabelAddCustom",Res)
    }
}

function CheckValuesBeforeAddCustom(Price,Name){
    var ErrorAddCustom = ""
    if(isNaN(Price)){ ErrorAddCustom = "The field 'Price' must be a number"; return ErrorAddCustom}
    if(Name == "" || Name == null){ ErrorAddCustom = "The field 'Name' cannot be empty"; return ErrorAddCustom}
    return true
}

function DeleteCustom(Id){
    var Query = "DELETE FROM inventariocustom WHERE IdProdotto = ?"
    pool.getConnection(function(err,connection){
        connection.query(Query,Id,function(error,results,fields){
            if(error) console.log(error)
            ipc.send("SetAlert","Delete")
            connection.release()
            location.reload()
        })
    })
}

function DuplicateCustom(Id){
    for(var CustomSelected of CustomList){
        if(CustomSelected.IdProdotto == Id){    
            console.log("trovato")
            var Query = "INSERT INTO inventariocustom (NomeProdotto,ReleaseDate,PrezzoProdotto,Taglia,QuantitaTotale,QuantitaAttuale,Sito,Compratore,ImmagineProdotto,PrezzoVendita,Profitto,Note,DataAggiunta,IdConto,IdUtente) values (?)"
            var Values = [
                [CustomSelected.NomeProdotto,CustomSelected.ReleaseDate,CustomSelected.PrezzoProdotto,CustomSelected.Taglia,1,1,CustomSelected.Sito,"",CustomSelected.ImmagineProdotto,0,-CustomSelected.PrezzoProdotto,CustomSelected.Note,GetTodaysDateDashFormat(),0,UserId]
            ]
            pool.getConnection(function(err,connection){
                connection.query(Query,Values,function(error,results,fields){
                    if(error) console.log(error)
                    CreateLog(`Duplicated ${$("#newShoeCustom").val()}`,"Inventory","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
                    ipc.send("SetAlert","Duplicate")
                    connection.release()
                    location.reload()
                })
            })
        }
    }
}
function PrepareSaleCustom(Id){
    $("#saleCustom").modal("toggle")
    for(var SelectedCustom of CustomList){
        if(SelectedCustom.IdProdotto == Id){
            console.log("trovato")
            $("#PrezzoProdottoCustom").val(SelectedCustom.PrezzoProdotto)
            $("#IdToSellCustom").val(SelectedCustom.IdProdotto)
        }
    }
}

function SaleCustom(Id){
    var FinalDate = ""
    var Price = $("#prodPriceSellCustom").val()
    var Res = CheckValuesBeforeSaleCustom(Price)
    if(Res){
        var Buyer = $("#prodSiteSellCustom").val()
        var Query = "UPDATE inventariocustom SET Profitto = ?,QuantitaAttuale = ?,Compratore = ?,immagineCompratore = ?,FlagComprata = ?,PrezzoVendita = ?,DataVendita = ? WHERE IdProdotto like ?"
        var Profitto = Price - $("#PrezzoProdottoCustom").val()
        var DateToAdd = $("#prodDateSellCustom").val()
        if(DateToAdd != ""){
            var AppData = DateToAdd.split("/")
            FinalDate = AppData[2] + "-" + AppData[1] + "-" + AppData[0]
        }else{
            FinalDate = GetTodaysDateDashFormat()
        }
        var Values = [Profitto,0,Buyer,"",1,Price,FinalDate,$("#IdToSellCustom").val()]
        pool.getConnection(function(err,connection){
            connection.query(Query,Values,function(error,results,fields){
                if(error) console.log(error)
                CreateLog(`Sold ${$("#newShoeCustom").val()}`,"Inventory","Sale",moment().format('MMMM Do YYYY, h:mm:ss a'))
                ipc.send("SetAlert","Sold")
                connection.release()
                location.reload()
            })
        })
    }else{
        ErrorCreation("errorLabelSaleCustom",Res)
    }
}

function CheckValuesBeforeSaleCustom(Price){
    var ErrorSaleCustom = ""
    if(isNaN(Price)){ ErrorSaleCustom = "The field 'Price' must be a number"; return ErrorSaleCustom}
    return true
}

function PrepareEditCustom(Id){
    var ShoeToModifyCustom = CustomList.filter(function(e){
        return e.IdProdotto == Id
    })
    $("#IdToModifyCustom").val(Id)
    $("#PriceToModifyCustom").val(ShoeToModifyCustom[0].PrezzoProdotto)
    $("#ProdDateToModifyCustom").val(FlipDateAndChange(ShoeToModifyCustom[0].ReleaseDate))
    $("#NotesToModifyCustom").val(ShoeToModifyCustom[0].Note)
    $("#SiteToModifyCustom").val(ShoeToModifyCustom[0].Sito)
    $("#SizeToModifyCustom").val(ShoeToModifyCustom[0].Taglia)
    $("#modificaCustom").modal("toggle")
}

function EditCustom(){
    var Id = $("#IdToModifyCustom").val()
    var NameProdEdited = ""
    for(var Custom of CustomList){
        if(Custom.IdProdotto == Id){
            console.log("Trovato")
            NameProdEdited = Custom.NomeProdotto
        }
    }
    var PrezzoProdotto = $("#PriceToModifyCustom").val()
    var D = $("#ProdDateToModifyCustom").val().split('/')
    var ReleaseDate = D[2] + "-" + D[1] + "-" + D[0]
    var Taglia = $("#SizeToModifyCustom").val()
    var Site = $("#SiteToModifyCustom").val()
    var Note = $("#NotesToModifyCustom").val()
    var Query = "UPDATE inventariocustom SET PrezzoProdotto = ?, ReleaseDate = ?, Taglia = ?,Sito = ?,Note = ?,Profitto = ? WHERE IdProdotto = ?"
    var Values = [PrezzoProdotto,ReleaseDate,Taglia,Site,Note,0 - PrezzoProdotto,Id]
    pool.getConnection(function(err,connection){
        connection.query(Query,Values,function(err,results,fields){
            if(err)console.log(err)
            console.log("Edited")
            CreateLog(`Edited ${NameProdEdited}`,"Inventory","Edit",moment().format('MMMM Do YYYY, h:mm:ss a'))
            ipc.send("SetAlert","Edit")
            connection.release()
            location.reload()
        })
    })
}

ipc.on("ErrorFoundResearch",function(event,arg){
    console.log("Error while scraping this product")
    console.log(arg.err)
    console.log("Trying to ask to the server")
    ipc.send("RequestedShoeDetailsServer",arg.latestArg)
})
