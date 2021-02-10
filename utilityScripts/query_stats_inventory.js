var UserId = require('electron').remote.getGlobal('UserId')
var Valuta = require('electron').remote.getGlobal('Valuta')
console.log("Valuta")
console.log(Valuta)
console.log("Id Utente")
console.log(UserId)

function SetInventoryRetailStats(ListOfItemsStockX,ListOfItemsCustom){
    var ResStockX = 0
    var ResCustom = 0
    for(var Shoe of ListOfItemsStockX){
        ResStockX += Shoe.PrezzoProdotto
    }
    for(var Item of ListOfItemsCustom){
        ResCustom += Item.PrezzoProdotto
    }
    var Res = ResCustom + ResStockX
    document.getElementById("InventoryRetail").innerHTML = Valuta + "" + Res.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
}

function SetInventoryValueStats(ListOfItemsStockX){
    var ResStockX = 0
    for(var Shoe of ListOfItemsStockX){
        ResStockX += Shoe.PrezzoMedioResell
    }
    document.getElementById("InventoryResell").innerHTML = Valuta + "" + ResStockX.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
}

async function SetInventoryNrItemsStats(ListOfItems){
    var Res = ListOfItems.length
    document.getElementById("StockXItems").innerHTML = Res
    //$("#StockXItems").attr("data-countup",`{count":${Res},"format":"comma","prefix":""}`)
}
function SetInventoryNrItemsCustomStats(ListOfItems){
    var Res = ListOfItems.length
    document.getElementById("CustomItems").innerHTML = Res
    //$("#CustomItems").attr("data-countup",`{count":${Res},"format":"comma","prefix":""}`)
}

exports.Retail = SetInventoryRetailStats
exports.Average = SetInventoryValueStats
exports.StockXItems = SetInventoryNrItemsStats
exports.CustomItems = SetInventoryNrItemsCustomStats