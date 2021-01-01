var mysql = require('mysql')
var moment = require('moment');
const { loadavg } = require('os');
const { each } = require('jquery');
var config = require('electron').remote.getGlobal('configuration')
var pool = require('electron').remote.getGlobal('pool')
var path = require("path")
var Util = require(path.join(__dirname,"/utilityScripts/query_stats_expenses.js"))

var GlobalList = []
var CostsBotList = []
var CostsCookGroupList = []
var CostsProxiesList = []
var CostsShipsList = []
var CostsOthersList = []

var UserId = require('electron').remote.getGlobal('UserId')
var Valuta = require('electron').remote.getGlobal('ValutaAcc')
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))
console.log("Valuta")
console.log(Valuta)
console.log("Id Utente")
console.log(UserId)

var Currency = ""

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
 
var Price = 0
var Name = ""
var Type = ""
var FirstDate = ""
var NextDate=""
var Img = ""

window.setInterval(CheckConnection,5000)

var UserId = 0
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

function GetTodaysYear() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  today = yyyy;
  return today;
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

$(document).ready(() =>{
  LoadExpenses()
})


function FlipDateAndChange(DateToChange){
  return moment(DateToChange).format('DD[/]MM[/]YYYY')
}

function ChangeDate(DateToChange){
  return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

function LoadExpenses(){
  ipc.send("getUserId")
  ipc.on("ReturnedId",async (event,arg) => {
    UserId = arg
    console.log(UserId)
    pool.getConnection(function(err,connection){
      connection.query("SELECT * FROM costi WHERE IdUtente = ?",UserId,  function (error, results, fields) {
        if(error) console.log(error)
        GlobalList = results
        SplitArrays(results)
        Util.SetTypes(results)
        Util.YearExpenses(results)
        Util.MonthExpenses(results)
      })
    })
  })
}
function SplitArrays(CostsList){
  var length1 = 0
  var length2 = 0
  var length3 = 0
  var length4 = 0
  var length5 = 0
  for(var Cost of CostsList){
    console.log(Cost)
    switch(Cost.NomeSelezioneCosto){
      case "Bot":
        CostsBotList.push(Cost)
        length3 += 1
        break;
      case "CookGroup":
        CostsCookGroupList.push(Cost)
        length1 += 1
        break;
      case "Proxy":
        CostsProxiesList.push(Cost)
        length2 += 1
        break;
      case "Ship":
        CostsShipsList.push(Cost)
        length4 += 1
        break;
      default:
        CostsOthersList.push(Cost)
        length5 += 1
        break;
    }
  }
  document.getElementById("Nr1").innerHTML = length1
  document.getElementById("Nr2").innerHTML = length2
  document.getElementById("Nr3").innerHTML = length3
  document.getElementById("Nr4").innerHTML = length4
  document.getElementById("Nr5").innerHTML = length5
  FillCards()
}

function FillCards(){
  for(var Cost of CostsBotList){
    document.getElementById("Bots").innerHTML += CreateCard(Cost)
  }
  for(var Cost of CostsCookGroupList){
    document.getElementById("CookGroups").innerHTML += CreateCard(Cost)
  }
  for(var Cost of CostsProxiesList){
    document.getElementById("Proxies").innerHTML += CreateCard(Cost)
  }
  for(var Cost of CostsShipsList){
    document.getElementById("Ships").innerHTML += CreateCard(Cost)
  }
  for(var Cost of CostsOthersList){
    document.getElementById("Others").innerHTML += CreateCard(Cost)
  }
  $("#Preloader1").css("display", "none");
}

function CreateCard(Cost){
  var RecurrencyMonth = ""
  switch(Cost.MesiRicorrenza){
    case 0:
      RecurrencyMonth = "One time cost"
      break;
    case 1:
      RecurrencyMonth = "Renewal every month"
      break;
    case 12:
      RecurrencyMonth = "Renewal every year"
      break;
    default:
      RecurrencyMonth = "Renewal every " + Cost.MesiRicorrenza + " months"
      break;
  }

  return "<div class='kanban-item'>" +
  "<div class='card kanban-item-card hover-actions-trigger' data-toggle='modal' data-target='#kanban-modal-1'>" +
    "<div class='card-body position-relative'>" +
      `<div class='mb-2'><span class='badge d-inline-block py-1 mr-1 mb-1 badge-soft-success'>Date: ${FlipDateAndChange(Cost.DataCosto)}</span><span class='badge d-inline-block py-1 mr-1 mb-1 badge-soft-primary'>Price: ${Cost.PrezzoCosto + " " + Currency} </span></div>`+
      `<p class='mb-0 font-weight-medium text-sans-serif'>${Cost.DescrizioneCosto}</p>`+ 
      "<div class='dropdown position-absolute text-sans-serif t-0 r-0 mt-card mr-card hover-actions'><button class='btn btn-sm btn-falcon-default py-0 px-2' type='button' data-boundary='viewport' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span class='fas fa-ellipsis-h' data-fa-transform='shrink-2'></span></button>" +
          "<div class='dropdown-menu dropdown-menu-right py-0'>" +
            "<a class='dropdown-item text-danger' onclick='Delete("+ Cost.IdCosto +")'>Remove</a>" +
          "</div>" +
        "</div>" +
      "<div class='kanban-item-footer'>" +
        "<div class='text-500'><span class='mr-2' data-toggle='tooltip'>"+RecurrencyMonth+"<span></span></span></div>" +
        "<div>" +
          "<div class='avatar avatar-l' data-toggle='tooltip'>" +
          `<img class='rounded-circle' src='${Cost.UrlFoto}' alt=''/>` +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>" +
  "</div>" +
"</div>"
}




// PROXY SECTION

function AddProxy(){
  Name = $("#ProxiesList option:selected").val()
  Price = $("#PriceProxies").val()
  Recurrency = $("#RecurrencyProxies").val()
  if(Name == "Select a Proxy"){
    Name = $("#ProxiesTextBox").val()
    Img = "https://pbs.twimg.com/profile_images/1252579140483588102/B7xqRatq_400x400.jpg"
  }else{
    Img = $("#ProxiesList option:selected").attr("data-value")
  }

  var Res = CheckValues(Name,Price,Recurrency)
  Type = "Proxy"
  if(Res == true){
    if($("#DateProxies").val() == "" || $("#DateProxies").val() == undefined){
      FirstDate = GetTodaysDate()
    }else{
      var SplittedDate = $("#DateProxies").val().split("/")
      FirstDate = SplittedDate[2] + "-" + SplittedDate[1] + "-" +SplittedDate[0]
    }
    console.log("Chosen Date")
    console.log(FirstDate)

    var StartingDate = new Date(FirstDate)
    var EndDate = moment(StartingDate)
    EndDate.add(Recurrency,'months')

    var Obj = {
      "UrlFoto": Img,
      "NomeSelezioneCosto": Type, 
      "PrezzoCosto": Price,
      "DescrizioneCosto": Name,
      "MesiRicorrenza": Recurrency,
      "DataCosto": FirstDate,
      "DataProssimoCosto": ChangeDate(EndDate),
      "DataAggiunta": GetTodaysDate()
    }
    SendToDB(Obj)
  }else{
    ErrorCreation("errorProxyModal",Res)
  }
}

// COOKGROUP SECTION 

function AddCookGroup(){
  Name = $("#CookGroupsList option:selected").val()
  Price = $("#PriceCookGroups").val()
  Recurrency = $("#RecurrencyCookGroups").val()
  if(Name == "Select a CookGroup"){
    Name = $("#CookGroupsTextBox").val()
    Img = "https://pbs.twimg.com/profile_images/1252579140483588102/B7xqRatq_400x400.jpg"
  }else{
    Img = $("#CookGroupsList option:selected").attr("data-value")
  }

  var Res = CheckValues(Name,Price,Recurrency)
  Type = "CookGroup"
  if(Res == true){
    if($("#DateCookGroups").val() == "" || $("#DateCookGroups").val() == undefined){
      FirstDate = GetTodaysDate()
    }else{
      var SplittedDate = $("#DateCookGroups").val().split("/")
      FirstDate = SplittedDate[2] + "-" + SplittedDate[1] + "-" +SplittedDate[0]
    }
    console.log("Chosen Date")
    console.log(FirstDate)

    var StartingDate = new Date(FirstDate)
    var EndDate = moment(StartingDate)
    EndDate.add(Recurrency,'months')

    var Obj = {
      "UrlFoto": Img,
      "NomeSelezioneCosto": Type, 
      "PrezzoCosto": Price,
      "DescrizioneCosto": Name,
      "MesiRicorrenza": Recurrency,
      "DataCosto": FirstDate,
      "DataProssimoCosto": ChangeDate(EndDate),
      "DataAggiunta": GetTodaysDate()
    }
    SendToDB(Obj)
  }else{
    ErrorCreation("errorCookGroupModal",Res)
  }
}

// BOT SECTION

function AddBot(){
  Name = $("#BotsList option:selected").val()
  Price = $("#PriceBots").val()
  Recurrency = $("#RecurrencyBots").val()
  if(Name == "Select a Bot"){
    Name = $("#BotsTextBox").val()
    Img = "https://pbs.twimg.com/profile_images/1252579140483588102/B7xqRatq_400x400.jpg"
  }else{
    Img = $("#BotsList option:selected").attr("data-value")
  }

  var Res = CheckValues(Name,Price,Recurrency)
  Type = "Bot"
  if(Res == true){
    if($("#DateBots").val() == "" || $("#DateBots").val() == undefined){
      FirstDate = GetTodaysDate()
    }else{
      var SplittedDate = $("#DateBots").val().split("/")
      FirstDate = SplittedDate[2] + "-" + SplittedDate[1] + "-" +SplittedDate[0]
    }
    console.log("Chosen Date")
    console.log(FirstDate)

    var StartingDate = new Date(FirstDate)
    var EndDate = moment(StartingDate)
    EndDate.add(Recurrency,'months')

    var Obj = {
      "UrlFoto": Img,
      "NomeSelezioneCosto": Type, 
      "PrezzoCosto": Price,
      "DescrizioneCosto": Name,
      "MesiRicorrenza": Recurrency,
      "DataCosto": FirstDate,
      "DataProssimoCosto": ChangeDate(EndDate),
      "DataAggiunta": GetTodaysDate()
    }
    SendToDB(Obj)
  }else{
    ErrorCreation("errorBotModal",Res)
  }
}


// SHIP SECTION

function AddShip(){
  Name = $("#ShipsList option:selected").val()
  Price = $("#PriceShips").val()
  Recurrency = $("#RecurrencyShips").val()
  if(Name == "Select a Ship"){
    Name = $("#ShipsTextBox").val()
    Img = "https://pbs.twimg.com/profile_images/1252579140483588102/B7xqRatq_400x400.jpg"
  }else{
    Img = $("#ShipsList option:selected").attr("data-value")
  }

  var Res = CheckValues(Name,Price,Recurrency)
  Type = "Ship"
  if(Res == true){
    if($("#DateShips").val() == "" || $("#DateShips").val() == undefined){
      FirstDate = GetTodaysDate()
    }else{
      var SplittedDate = $("#DateShips").val().split("/")
      FirstDate = SplittedDate[2] + "-" + SplittedDate[1] + "-" +SplittedDate[0]
    }
    console.log("Chosen Date")
    console.log(FirstDate)

    var StartingDate = new Date(FirstDate)
    var EndDate = moment(StartingDate)
    EndDate.add(Recurrency,'months')

    var Obj = {
      "UrlFoto": Img,
      "NomeSelezioneCosto": Type, 
      "PrezzoCosto": Price,
      "DescrizioneCosto": Name,
      "MesiRicorrenza": Recurrency,
      "DataCosto": FirstDate,
      "DataProssimoCosto": ChangeDate(EndDate),
      "DataAggiunta": GetTodaysDate()
    }
    SendToDB(Obj)
  }else{
    ErrorCreation("errorShipModal",Res)
  }
}

// OTHER SECTION

function AddOther(){
  Name = $("#OthersTextBox").val()
  Price = $("#PriceOthers").val()
  Recurrency = $("#RecurrencyOthers").val()
  Img = "https://pbs.twimg.com/profile_images/1252579140483588102/B7xqRatq_400x400.jpg"

  var Res = CheckValues(Name,Price,Recurrency)
  Type = "Others"
  if(Res == true){
    if($("#DateOthers").val() == "" || $("#DateOthers").val() == undefined){
      FirstDate = GetTodaysDate()
    }else{
      var SplittedDate = $("#DateOthers").val().split("/")
      FirstDate = SplittedDate[2] + "-" + SplittedDate[1] + "-" +SplittedDate[0]
    }
    console.log("Chosen Date")
    console.log(FirstDate)

    var StartingDate = new Date(FirstDate)
    var EndDate = moment(StartingDate)
    EndDate.add(Recurrency,'months')

    var Obj = {
      "UrlFoto": Img,
      "NomeSelezioneCosto": Type, 
      "PrezzoCosto": Price,
      "DescrizioneCosto": Name,
      "MesiRicorrenza": Recurrency,
      "DataCosto": FirstDate,
      "DataProssimoCosto": ChangeDate(EndDate),
      "DataAggiunta": GetTodaysDate()
    }
    SendToDB(Obj)
  }else{
    ErrorCreation("errorOtherModal",Res)
  }
}

function SendToDB(Obj){
  var Years = 5
  var Months = 12
  var TotMonths = (Years * Months)

  var ArrMonths = new Array(TotMonths + 1).join('0').split('').map(parseFloat)
  console.log(ArrMonths.length)

  if(Obj.MesiRicorrenza != 0){
    var StartingMonth = parseInt(Obj.DataCosto.split("-")[1]) 
    console.log(StartingMonth)
    var m = 0
    var RecMonths = parseInt(Obj.MesiRicorrenza)
    console.log("Mesi ricorrenza"  + Obj.MesiRicorrenza)
    var I = 0
    for(m = StartingMonth - 1; m < TotMonths; m = m + RecMonths){
      console.log(m)
      ArrMonths[m] = parseInt(Obj.PrezzoCosto)
    }
    console.log(ArrMonths)
  }

  var Values = [
    [Obj.NomeSelezioneCosto,Obj.DescrizioneCosto,Obj.UrlFoto,Obj.DataCosto,Obj.DataProssimoCosto,Obj.DataAggiunta,Obj.PrezzoCosto,Obj.MesiRicorrenza,ArrMonths.join(" "),1023,UserId]
  ]
  var Query = "INSERT INTO costi (NomeSelezioneCosto,DescrizioneCosto,UrlFoto,DataCosto,DataProssimoCosto,DataAggiunta,PrezzoCosto,MesiRicorrenza,PagamentoMesi,IdConto,IdUtente) VALUES (?)"
  pool.getConnection(function(err,connection){
    connection.query(Query,Values,function(err,results,fields){
      if(err)console.log(err)
      CreateLog(`Added a new expenses (${Values[0][0]})`,"Expenses","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
      connection.release()
      location.reload()
    })
  })
}

function Delete(Id){
  for(var Exp of GlobalList){
    if(Exp.IdCosto == Id){
      var Query = "DELETE FROM costi WHERE IdCosto = ?"
      pool.getConnection(function(err,connection){
        connection.query(Query,Id,function(error,results,fields){
            if(error) console.log(error)
            CreateLog(`Deleted an expenses (${Exp.NomeSelezioneCosto})`,"Expenses","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
            location.reload()
        })
      })
    }
  }
}

function ErrorCreation(target, message){
  document.getElementById(target).innerHTML = message
}

function CheckValues(N,P,R){
  var Error = ""
  if(N == null || N == "") {Error = "The field 'Name' cannot be empty"; return Error}
  if(isNaN(P)) {Error = "The field 'Price' need to be number"; return Error}
  if(P == null || P == "") {Error = "The field 'Price' cannot be empty"; return Error}
  if(R == null || R == "") {Error = "The field 'Recurrency' cannot be empty"; return Error}
  return true
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

function CreateLog(Mess,Sec,Act,DateTime){
  var ObjTosend = {
    Message: Mess,
    Section: Sec,
    Action: Act,
    DateTime: DateTime
  }
  ipc.send("CreateLog",ObjTosend)
}