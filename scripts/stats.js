var mysql = require('mysql')
var moment = require('moment')
const { ipcMain } = require('electron')
var config = require('electron').remote.getGlobal('configuration')
var connection = require('electron').remote.getGlobal('conn')
var windowStats = require('electron').remote.getGlobal('windowStats')

function minimize(){
    ipc.send("Minimize")
}
function maximize(){
    ipc.send("Maximize")
}
function quit(){
    ipc.send("AppQuit")
}

ipc.on("fillProductStats",(event,arg) => {
    console.log("messaggio arrivato")
    console.log(arg)
    document.getElementById("prodName").innerText = arg[0].name
    document.getElementById("prodImg").setAttribute("src",arg[0].media.imageUrl)
    document.getElementById("prodRelease").innerText = "Release: " + FlipDate(arg[0].release_date)
    document.getElementById("prodPrice").innerHTML = "<span class='fas fa-chart-bar text-danger mr-1'></span>Price: " + arg[0].searchable_traits["Retail Price"]
    document.getElementById("prodValue").innerHTML = "<span class='fas fa-chart-bar text-warning mr-1'></span>Avg. Value: " + arg[0]
})

ipc.on("fillVariantStats",(event,arg) => {
    document.getElementById("prodVariants").innerHTML = "<h6>Market Value</h6><br>"
    console.log("messaggio arrivato")
    console.log(arg)
    for(var Variant of arg.variants){
        console.log(Variant)
        document.getElementById("prodVariants").innerHTML += "<span class='mb-1' style = 'font-color:white;'>Size " + Variant.size + "<span class='badge badge rounded-capsule badge-soft-primary' style='float: right;'>$"+ Variant.market.averageDeadstockPrice +"</span></span><br><br>"
    }
})

ipc.on("open", (event,arg) => {
    console.log("this window is now open")
    windowStats.show()
})

ipc.on("close", (event,arg) => {
    console.log("this window is now closed")
    windowStats.hide()
})

function FlipDate(date){
    var date1 = date.split("-")
    return date1[2] + "/" + date1[1] + "/" + date1[0]
}