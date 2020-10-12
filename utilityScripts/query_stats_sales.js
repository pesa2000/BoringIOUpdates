var ResProfit = 0
var ResTotalSold = 0
var ResNrStockX = 0
var ResNrCustom = 0

var UserId = require('electron').remote.getGlobal('UserId')
var Valuta = require('electron').remote.getGlobal('ValutaAcc')
console.log("Valuta")
console.log(Valuta)
console.log("Id Utente")
console.log(UserId)
var UtilCurr =  require(path.join(__dirname,"/currency-conversion.js"))

var Currency = UtilCurr.GetCurrencyFromUTF8(Valuta)
console.log(Currency)

function SetSalesTotalProfit(ListStockX,ListCustom){
    for(var Shoe of ListStockX){
        ResProfit += Shoe.Profitto
    }
    for(var Item of ListCustom){
        ResProfit += Item.Profitto
    }
    $("#TotalProfit").text(Currency +  "" + ResProfit)
}

function SetSalesTotal(ListStockX,ListCustom){
    for(var Shoe of ListStockX){
        ResTotalSold += Shoe.PrezzoVendita
    }
    for(var Item of ListCustom){
        ResTotalSold += Item.PrezzoVendita
    }
    $("#TotalSales").text(Currency + "" +ResTotalSold)
}

function SetSalesNrStockX(ListStockX){
    ResNrStockX = ListStockX.length
    $("#TotalSalesStockX").attr("data-countup",`{"count":${ResNrStockX},"format":"comma","prefix":""}`)
    document.getElementById("TotalSalesStockX").innerHTML = ResNrStockX
}

function SetSalesNrCustom(ListCustom){
    ResNrCustom = ListCustom.length
    $("#TotalSalesCustom").attr("data-countup",`{"count":${ResNrCustom},"format":"comma","prefix":""}`)
    document.getElementById("TotalSalesCustom").innerHTML = ResNrCustom
}

exports.Profit = SetSalesTotalProfit
exports.TotalSold = SetSalesTotal
exports.StockXItemsSold = SetSalesNrStockX
exports.CustomItemsSold = SetSalesNrCustom 