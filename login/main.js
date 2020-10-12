//@ts-ignore
const fetch = require("node-fetch")
const request = require("request")
var moment = require('moment')
const ipcMain = require('electron').ipcMain
const BrowserWindow = require("electron").BrowserWindow
const app = require('electron').app
console.log(app)
const os = require("os-utils");
const path=require('path')
var AppDataDir = app.getPath("userData")
console.log(AppDataDir)
const url=require('url')
let $ = require('jquery')
var mysql = require('mysql')
const bcrypt = require('bcrypt')
const fs = require('fs')
const got = require('got')
var AccountSavedDirectory = path.join(AppDataDir,"AccountSaved.txt")
console.log(AccountSavedDirectory)
//const VersionSavedDirectory = path.join(app.getPath("userData"),"/ProgramVersion.txt")
const InventoryPath = path.join(__dirname,"../scripts/inventory.js")
const StockxAPI = require('./../node_modules/stockx-api/index.js');
var LastConnection = "Connected"
var BOUGHT = false
var DirectoryLog = app.getPath("userData")
console.log("Directory Appdata")
console.log(DirectoryLog)
console.log("Program Version")
console.log(app.getVersion())
const {autoUpdater} = require("electron-updater")
autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "debug"
autoUpdater.checkForUpdatesAndNotify()

var GlobalIdUtente = 0

app.on('ready', () => {
  console.log("App ready")
  CheckLogFile()
})

if(fs.existsSync(AccountSavedDirectory)){
  console.log("La cartella esiste")
}else{
  fs.writeFileSync(AccountSavedDirectory,"",()=>{})
}

if(fs.existsSync(path.join(DirectoryLog,"/InventoryExported"))){
  console.log("La cartella esiste")
}else{
  console.log("Creo la cartella")
  fs.mkdirSync(path.join(DirectoryLog,"/InventoryExported"))
}

function CheckLogFile(){
  if(fs.existsSync(path.join(DirectoryLog,"/LogMessage.json"))){
    console.log("Il file esiste")
  }else{
    console.log("Il file non esiste")
    var LogsFile = {Logs:[]}
    fs.writeFile(path.join(DirectoryLog,"/LogMessage.json"),JSON.stringify(LogsFile),() =>{
      console.log("File Creato")
    })
  }
  createWindows()
}
var internetAvailable = require("internet-available");

var DEBUGGER_MODE = true
var SubscriptionId = ""
var CustomerIdDB = ""
var SubscriptionChanged = ""

var LatestAlertInventory = "No Alert Yet"
global.AlertInventory = LatestAlertInventory

ipcMain.on("SetAlert",(event,arg) => {
  LatestAlertInventory = arg
  console.log(LatestAlertInventory)
  global.AlertInventory = LatestAlertInventory
})
var BETA_MODE = true

function GetTodaysDateDashFormat(){
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0')
  var yyyy = today.getFullYear()
  today = yyyy + '_' + mm + '_' + dd;
  return today
}

function GetTodaysDateDashFormat1(){
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0')
  var yyyy = today.getFullYear()
  today = yyyy + '-' + mm + '-' + dd;
  return today
}

//userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
const stockX = new StockxAPI();

//app.on("ready",CheckLogFile())

var connection
var config = {
  host     : 'www.boringio.com',
  user     : 'desktopuser',
  password : 'anfi1812',
  database : 'gestionaleprodotti'
}
connection = mysql.createConnection(config);
global.configuration = config
global.conn = connection
var SelectedTheme = ""

let win
let child
global.windowStats = null
let userId
let Username
let Email
let Renew
let Days
let Img
let Valuta

function sleep(ms) {
  try{
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  catch(err){
    console.log(err)
  }
}

async function createWindows() {
  var LOGGEDIN = false
  fs.readFile(AccountSavedDirectory, function (err, data) {
    if (err) LOGGEDIN = false
      rawFile = data.toString()
      console.log("FILE")
      console.log(rawFile)
      var Acc = rawFile
      if(Acc != ""){
          console.log("ACC letto")
          console.log(Acc)
          var AccSplitted = Acc.split(":")
          UsernameSaved = AccSplitted[0]
          PasswordSaved = AccSplitted[1]
          connection.query('SELECT * FROM utenti WHERE Username like ?', UsernameSaved,async function (error, results, fields) {
          CustomerIdDB = results[0].CustomerId
          SubscriptionId = results[0].SubscriptionId
          if(BETA_MODE != true){
            await CheckStripeBeforeStart(results)
          }else{
            BOUGHT = true
          }
          console.log("DIO PORCO L HO COMPRATO O NO")
          console.log(BOUGHT)
          if (error) throw error;
              console.log(results)
              if(results.length == 1){
                  if(PasswordSaved == results[0].Password){
                    if(BOUGHT == true){
                      LOGGEDIN = true
                      setUserId(results[0].UserId)
                      setUsername(results[0].Username)
                      setEmail(results[0].Email)
                      setRenew(results[0].TypeSubscription)
                      setRenewDays(results[0].NextDate)
                      setImg(results[0].Immagine)
                      setValuta(results[0].Valuta)

                      GlobalIdUtente = results[0].UserId

                      win = new BrowserWindow({width:1600,height:1200,show: true,frame: false,webPreferences: {
                        enableRemoteModule: true,
                        nodeIntegration: true,
                        zoomFactor: 1.0
                      }})
                      win.loadURL(url.format({
                        pathname:path.join(__dirname,'../home.html'),
                        protocol:'file',
                        slashes:true
                      }))
                      win.webContents.setZoomFactor(0.9)
                      if(DEBUGGER_MODE){
                        win.webContents.openDevTools()
                      }
                      win.removeMenu()
                      win.show()

                      win.on("close", (event,arg) => {
                        if(windowStats) (windowStats.close() , windowStats = null)
                        app.quit()
                      })
                      windowStats = new BrowserWindow({width:800,height:600,show: false,frame: true,webPreferences: {
                        enableRemoteModule: true,
                        nodeIntegration: true,
                        zoomFactor: 1.0
                      }})
                      windowStats.loadURL(url.format({
                        pathname:path.join(__dirname,'../stats.html'),
                        protocol:'file',
                        slashes:true
                      }))
                      windowStats.removeMenu()
                      windowStats.on("close",(event,arg)=> {
                        event.preventDefault()
                        if(windowStats) windowStats.hide()
                        console.log("hidden stats for now")
                      })
                    }else{
                      console.log("Errore")
                    }
                  }
              }
          })
      }
  })
  await sleep(1000)
  if(LOGGEDIN == false){
    win = new BrowserWindow({width:1600,height:1200,show: false,frame: false,webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      zoomFactor: 1.0
    }})
    child = new BrowserWindow({parent: win,width:800,height:600,frame: false,webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    }})
    child.loadURL(url.format({
      pathname:path.join(__dirname,'login.html'),
      protocol:'file',
      slashes:true
    }))
    if(DEBUGGER_MODE){
      child.webContents.openDevTools()
    }
    child.removeMenu()
  }
}
function setValuta(input){
  Valuta = input
  global.ValutaAcc = Valuta
}

function setUserId(input){
  global.UserId = input
  userId = input
}
function setUsername(input){
  Username = input
}
function setEmail(input){
  Email = input
}
function setRenew(input){
  Renew = input
}
function setRenewDays(input){
  Days = input
}
function setImg(input){
  Img = input
}


ipcMain.on('entry-accepted', (event, arg) => {
  if(arg=='start'){
    win.loadURL(url.format({
      pathname:path.join(__dirname,'../home.html'),
      protocol:'file',
      slashes:true
    }))
    win.webContents.setZoomFactor(1.0)
    win.removeMenu()
    win.show()
    if(DEBUGGER_MODE == true){
      win.webContents.openDevTools()
    }
    child.hide()
    child.close()
    return 0
  }
})

ipcMain.on("LogOut",function (){
  fs.writeFile(AccountSavedDirectory, "", function (err) {
    if (err) throw err;
        console.log('Saved!');
    });
    app.removeAllListeners()
    app.relaunch()
    app.exit()
})

ipcMain.handle("setUserId", async(event,arg) => {
  console.log(arg)
  GlobalIdUtente = arg
  setUserId(arg)
})

ipcMain.handle("setUsername", async(event,arg) => {
  console.log(arg)
  setUsername(arg)
})

ipcMain.handle("setEmail", async(event,arg) => {
  console.log(arg)
  setEmail(arg)
})

ipcMain.handle("setRenew", async(event,arg) => {
  console.log(arg)
  setRenew(arg)
})

ipcMain.handle("setRenewDays", async(event,arg) => {
  console.log(arg)
  setRenewDays(arg)
})

ipcMain.handle("setImg", async(event,arg) => {
  console.log(arg)
  setImg(arg)
})

ipcMain.handle("setValuta", (event,arg) =>{
  console.log("Valuta" + arg)
  setValuta(arg)
})

ipcMain.on('getUserId', (event, args) => {
  console.log("Richiesta user id")
  event.sender.send("ReturnedId",userId)
})

ipcMain.on('getValuta', (event, args) => {
  event.sender.send("ReturnedValuta",Valuta)
})

ipcMain.on('getUsername', (event, args) => {
  event.sender.send("ReturnedUsername",Username)
})

ipcMain.on('getEmail', (event, args) => {
  event.sender.send("ReturnedEmail",Email)
})

ipcMain.on('getRenew', (event, args) => {
  event.sender.send("ReturnedRenew",Renew)
})

ipcMain.on('getNextDate', (event, args) => {
  event.sender.send("ReturnedDays",Days)
})

ipcMain.on('getImg', (event, args) => {
  event.sender.send("ReturnedImg",Img)
})

ipcMain.on('Minimize', async (event, arg) => {
  win.minimize()
})

ipcMain.on('Maximize', async (event, arg) => {
  if(!win.isMaximized()){
    win.maximize()
  }else{
    win.unmaximize()
  }
})

ipcMain.on('AppQuit',async (event,arg) => {
  app.quit()
})

ipcMain.on('close', async (event, arg) => {
  event.preventDefault()
  console.log("close event")
  app.removeAllListeners()
  windowStats.quit()
  windowStats = null
  app.exit()
  app.quit()
})

ipcMain.on("WindowTracking",(event,arg) => {
  console.log("It should open another window")
  var WindowForTracking = new BrowserWindow({width:800,height:600,show: false,frame: true})
  WindowForTracking.loadURL(arg)
  WindowForTracking.show()
  WindowForTracking.removeMenu()
})

ipcMain.on("SearchProducts",(event,arg) => {
  stockX.newSearchProducts(arg, {
      limit: 8
  })
  .then(products => (/*console.log(products),*/event.sender.send("ReturnedProducts",products)))
  .catch(err => console.log(`Error searching: ${err.message}`));
})

ipcMain.on("RequestedShoeDetails",(event,arg) => {
  stockX.fetchProductDetails('https://stockx.com/' + arg)
  .then(product => (console.log(product),event.sender.send("ReturnedProductDetails",product)))
  .catch(err => {
    console.log(`Error scraping product details: ${err.message}`)
    event.sender.send("ErrorFoundResearch",{err:err.message,lastArg:arg})
  });
})

ipcMain.on("RequestedShoeDetailsArray",async (event,arg) => {
  var ArrRes = []
  var Res = ""
  var ObjTosend = {
    Message: "Synchronizing stockX prices",
    Section: "Inventory/Sale",
    Action: "Synchronizing",
    DateTime: moment().format('MMMM Do YYYY, h:mm:ss a')
  }
  CreateLog(ObjTosend)
  for(var SingleShoe of arg){
    await stockX.fetchProductDetails('https://stockx.com/' + SingleShoe.Url)
    .then(async product => {Res = await GetPrice(product,SingleShoe.Size); ArrRes.push({Id: SingleShoe.Id,Price: Res})})
    .catch(err => console.log(`Error scraping product details: ${err.message}`));
  }
  console.log("RES")
  console.log(ArrRes)
  event.sender.send("ReturnedProductDetailsArr",ArrRes)
})

function GetPrice(SingleProduct,Size){
  for(var Variant of SingleProduct.variants){
    if(Variant.size == Size){
      console.log(Variant.market.averageDeadstockPrice)
      return Variant.market.averageDeadstockPrice
    }
  }
}

ipcMain.on("RequestedShoeDetailsEdit",(event,arg) => {
  stockX.fetchProductDetails('https://stockx.com/' + arg)
  .then(product => (console.log(product),event.sender.send("ReturnedProductDetailsForEdit",product)))
  .catch(err => console.log(`Error scraping product details: ${err.message}`));
})


ipcMain.on("CreateLog",(event,arg) => {
    console.log("Creating a Log")
    console.log(arg)
    CreateLog(arg)
})

function CreateLog(ObjLog){ 
  var FileContentLog = fs.readFileSync(path.join(DirectoryLog, "/LogMessage.json"), "utf8");
  var Json = JSON.parse(FileContentLog)
  console.log(Json)
  Json.Logs.push(ObjLog)
  fs.writeFileSync(path.join(DirectoryLog, "/LogMessage.json"),JSON.stringify(Json),"utf8")
}


ipcMain.on("CheckConnection",(event,arg)=>{
  internetAvailable().then(function(){
    event.sender.send("CheckedConnection","Connected")
    LastConnection = "Connected"  
  }).catch(function(){
    if(LastConnection == "Connected"){
      var ObjTosend = {
        Message: "Lost connection to the server",
        Section: "General",
        Action: "Connection Error",
        DateTime: moment().format('MMMM Do YYYY, h:mm:ss a')
      }
      CreateLog(ObjTosend)
    }
    LastConnection = "Not Connected"
    event.sender.send("CheckedConnection","Not Connected")
  });
})

ipcMain.on("RequestedExportInventory",(event,arg) => {
  console.log("ExportRequested")
  var TotalInventory = {Full_Inventory:[]}
  var Inventory = {Inventory:[]}
  var InventoryCustom = {Inventory_Custom:[]}
  var Query = "SELECT * FROM inventario WHERE IdUtente like ? AND QuantitaAttuale = 1"
  connection.query(Query,userId,function(error,results){
    if(error) console.log(error)
    for(var i = 0; i < results.length; i++){
      var SingleItem = {
        "Type": "StockX Item",
        "Product Name":results.NomeProdotto,
        "Price": results.PrezzoProdotto,
        "Release Date" : results.ReleaseDate,
        "Added Date" : results.DataAggiunta,
        "Size": results.Taglia,
        "Average StockX Price": results.prezzoMedioResell,
        "Notes": results.Note
      }
      Inventory.Inventory.push(SingleItem)
    }
    connection.query("SELECT * FROM inventariocustom WHERE IdUtente like ? AND QuantitaAttuale = 1",UserId,function(error,results){
      if(error) console.log(error)
      for(var i = 0; i < results.length; i++){
        var SingleItemCustom = {
          "Type":"Custom Item",
          "Product Name":results.NomeProdotto,
          "Price": results.PrezzoProdotto,
          "Release Date" : results.ReleaseDate,
          "Added Date" : results.DataAggiunta,
          "Size": results.Taglia,
          "Notes": results.Note
        }
        InventoryCustom.Inventory_Custom.push(SingleItemCustom)
      }
      TotalInventory.Full_Inventory.push(Inventory)
      TotalInventory.Full_Inventory.push(InventoryCustom)
      var FileName = "Inventory_" + GetTodaysDateDashFormat().toString() + ".json"
      var FileDir = "/InventoryExported/" + FileName
      var FullPath = path.join(DirectoryLog,FileDir)
      console.log("Full path")
      console.log(FullPath)
      fs.writeFileSync(path.join(FullPath),JSON.stringify(TotalInventory),() => {console.log("Writing new file")})
    })
  })
})

ipcMain.on("RequestedExportInventorySold",(event,arg) => {
  console.log("ExportRequested")
  var TotalInventorySold = {Full_Inventory_Sold:[]}
  var InventorySold = {Inventory_Sold:[]}
  var InventoryCustomSold = {Inventory_Custom_Sold:[]}
  var Query = "SELECT * FROM inventario WHERE IdUtente like ? AND QuantitaAttuale = 0"
  connection.query(Query,userId,function(error,results){
    if(error) console.log(error)
    for(var i = 0; i < results.length; i++){
      var SingleItem = {
        "Type": "StockX Item",
        "Product Name":results.NomeProdotto,
        "Price": results.PrezzoProdotto,
        "Release Date" : results.ReleaseDate,
        "Added Date" : results.DataAggiunta,
        "Size": results.Taglia,
        "Average StockX Price": results.prezzoMedioResell,
        "Notes": results.Note,
        "Date Sold": results.DataVendita,
        "Price Sold": results.PrezzoVendita 
      }
      InventorySold.Inventory_Sold.push(SingleItem)
    }
    connection.query("SELECT * FROM inventariocustom WHERE IdUtente like ? AND QuantitaAttuale = 0",UserId,function(error,results){
      if(error) console.log(error)
      for(var i = 0; i < results.length; i++){
        var SingleItemCustom = {
          "Type":"Custom Item",
          "Product Name":results.NomeProdotto,
          "Price": results.PrezzoProdotto,
          "Release Date" : results.ReleaseDate,
          "Added Date" : results.DataAggiunta,
          "Size": results.Taglia,
          "Notes": results.Note,
          "Date Sold": results.DataVendita,
          "Sold  Price": results.PrezzoVendita 
        }
        InventoryCustomSold.Inventory_Custom_Sold.push(SingleItemCustom)
      }
      TotalInventorySold.Full_Inventory_Sold.push(InventorySold)
      TotalInventorySold.Full_Inventory_Sold.push(InventoryCustomSold)
      var FileName = "Inventory_Sold_" + GetTodaysDateDashFormat().toString() + ".json"
      var FileDir = "/InventoryExported/" + FileName
      var FullPath = path.join(DirectoryLog,FileDir)
      console.log("Full path")
      console.log(FullPath)
      fs.writeFileSync(path.join(FullPath),JSON.stringify(TotalInventorySold),() => {console.log("Writing new file")})
    })
  })
})

ipcMain.on("CheckStripe",async (event,arg) => {
  await CheckStripeBeforeStart(arg)
  event.sender.send("ReturnedStripeLogin",BOUGHT)
})

async function CheckStripeBeforeStart(User1){
  await fetch("https://www.boringio.com:5000/CheckStripeUser", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({User:User1}) })
  .then(async res => res.json())
  .then(async json => {console.log(json.Res);await SetBought(json.Res)});
}

async function SetBought(res){
  BOUGHT = res
}

ipcMain.on("ChangePaymentMethod",async (event,arg) =>{
  await ChangePaymentMethods(CustomerIdDB,SubscriptionId,arg)
  event.sender.send("NewPaymentMethod",SubscriptionChanged)
})

async function ChangePaymentMethods(IdCustomer,IdSubscription,Card){
  var card =  {
    number: Card.number,
    exp_month: Card.month,
    exp_year: Card.year,
    cvc: Card.cvc,
  }
  console.log(IdSubscription)
  console.log(card)
  await fetch("https://www.boringio.com:5000/ModifyStripePayment", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({IdSubscription: IdSubscription,Card:card}) })
  .then(async res => res.json())
  .then(async json => {console.log(json);await SetNewPm(json)});
}

async function SetNewPm(json){
  if(json.Res == "DELETED_SUBSCRIPTION_ERROR"){
    SubscriptionChanged = false
  }else{
    SubscriptionChanged = json
  }
}

function ChangeDate(DateToChange){
  return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

ipcMain.on("ResetAlert",(event,arg) =>{
  LatestAlertInventory = "No Alert Yet"
  global.AlertInventory = LatestAlertInventory
})

ipcMain.on("ChangePassword",(event,arg) => {
  bcrypt.hash(arg.pass, arg.saltRounds, function(err, hash) {
    if(err) throw err
    console.log(hash)
  });
})

ipcMain.on("DeleteSubscription",async (event,arg) => {
  console.log("Id da mandare")
  console.log(SubscriptionId)
  await fetch("https://www.boringio.com:5000/DeleteStripeSubscription", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({IdSubscription: SubscriptionId})})
  .then(async res => res.json())
  .then(async json =>  event.sender.send("SubscriptionDeleted",json));
})

ipcMain.on("ReturnStripeSub",async (event,arg) => {
  await fetch("https://www.boringio.com:5000/GetSub", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({IdSubscription: SubscriptionId})})
  .then(async res => res.json())
  .then(async json => event.sender.send("ReturnedSub",json));
})

var DATAGRAPHS = []

function GetNewDateYear(){
  var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
  console.log(d[2])
  return d[2]
}

function GetNewDateMonth(){
  var m = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
  console.log(m[1])
  return m[1]
}

function TranslateDate(DateChosen){
  var m = moment(new Date(DateChosen)).format("YYYY[-]MM[-]DD")
  return m
}

global.DataMainGraphs = DATAGRAPHS

var TotMonth1 = 0
var TotMonth2 = 0
var TotMonth3 = 0
var TotMonth4 = 0
var TotMonth5 = 0
var TotMonth6 = 0
var TotMonth7 = 0
var TotMonth8 = 0
var TotMonth9 = 0
var TotMonth10 = 0
var TotMonth11 = 0
var TotMonth12 = 0


var TotWeek1 = 0
var TotWeek2 = 0
var TotWeek3 = 0
var TotWeek4 = 0
var TotWeek5 = 0

ipcMain.on("RequestedDataGraphs", (event,arg) => {
  ResetVar()
  DATAGRAPHS.length = 0
  console.log("DATAGRAPHS POULITO")
  console.log(DATAGRAPHS)
  console.log("Richiesta arrivata")
  console.log("Filtro scelto" + arg.p1)
  if(arg.p1 == "Year"){
    connection.query("SELECT Profitto,MONTH(DataVendita) as Mese FROM inventario WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND QuantitaAttuale = 0 ORDER BY DataVendita ASC",[GlobalIdUtente,GetNewDateYear()],  function (error, results, fields) {
      for(var k of results){
        SetMonthLifetime(k)
      }
      connection.query("SELECT Profitto,MONTH(DataVendita) as Mese FROM inventariocustom WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND QuantitaAttuale = 0 ORDER BY DataVendita ASC",[GlobalIdUtente,GetNewDateYear()], function(error,results,fields){
        if(error)console.log(error)
        for(var c of results){
          SetMonthLifetime(c)
        }
        DATAGRAPHS.push({y: `Jan`, item1: TotMonth1})
        DATAGRAPHS.push({y: `Feb`, item1: TotMonth2})
        DATAGRAPHS.push({y: `Mar`, item1: TotMonth3})
        DATAGRAPHS.push({y: 'Apr', item1: TotMonth4})
        DATAGRAPHS.push({y: `May`, item1: TotMonth5})
        DATAGRAPHS.push({y: `Jun`, item1: TotMonth6})
        DATAGRAPHS.push({y: 'Jul', item1: TotMonth7})
        DATAGRAPHS.push({y: `Aug`, item1: TotMonth8})
        DATAGRAPHS.push({y: `Sep`, item1: TotMonth9})
        DATAGRAPHS.push({y: `Oct`, item1: TotMonth10})
        DATAGRAPHS.push({y: `Nov`, item1: TotMonth11})
        DATAGRAPHS.push({y: `Dec`, item1: TotMonth12})
        if(arg.p2 == "OnLoad"){
          event.sender.send("ReturnedDataGraphsOnLoad",DATAGRAPHS)
        }else{
          event.sender.send("ReturnedDataGraphsFutureCalls",DATAGRAPHS)
        }
      })
    })
  }else{
    connection.query("SELECT NomeProdotto,PrezzoProdotto,DAY(DataVendita) as Giorno,Profitto FROM inventario WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ? AND QuantitaAttuale = 0 ORDER BY DataVendita ASC",[GlobalIdUtente,parseInt(GetNewDateYear()),arg.p1],  function (error, results, fields) {
      if(error) console.log(error)
      ResetVar2()
      for(var k of results){
        SetWeekProfit(k)
      }
      connection.query("SELECT NomeProdotto,PrezzoProdotto,DAY(DataVendita) as Giorno,Profitto FROM inventariocustom WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ? AND QuantitaAttuale = 0 ORDER BY DataVendita ASC",[GlobalIdUtente,parseInt(GetNewDateYear()),arg.p1],function(error,results,fields){
        if(error)console.log(error)
        for(var c of results){
          SetWeekProfit(c)
        }
        DATAGRAPHS.push({y: `First Week`, item1: TotWeek1})
        DATAGRAPHS.push({y: `Second Week`, item1: TotWeek2})
        DATAGRAPHS.push({y: `Third Week`, item1: TotWeek3})
        DATAGRAPHS.push({y: `Fourth Week`, item1: TotWeek4})
        DATAGRAPHS.push({y: `Fifth Week`, item1: TotWeek5})
        if(arg.p2 == "OnLoad"){
          event.sender.send("ReturnedDataGraphsOnLoad",DATAGRAPHS)
        }else{
          event.sender.send("ReturnedDataGraphsFutureCalls",DATAGRAPHS)
        }
      })
    })
  }
})


function SetMonthLifetime(k){
  switch(k.Mese){
    case 1:
      TotMonth1 += parseInt(k.Profitto)
      break;
    case 2:
      TotMonth2 +=  parseInt(k.Profitto)
      break;
    case 3:
      TotMonth3 +=  parseInt(k.Profitto)
      break;
    case 4:
      TotMonth4 +=  parseInt(k.Profitto)
      break;
    case 5:
      TotMonth5 +=  parseInt(k.Profitto)
      break;
    case 6:
      TotMonth6 +=  parseInt(k.Profitto)
      break;
    case 7:
      TotMonth7 +=  parseInt(k.Profitto)
      break;
    case 8:
      TotMonth8 +=  parseInt(k.Profitto)
      break;
    case 9:
      TotMonth9 +=  parseInt(k.Profitto)
      break;
    case 10:
      TotMonth10 +=  parseInt(k.Profitto)
      break;
    case 11:
      TotMonth11 +=  parseInt(k.Profitto)
      break;
    case 12:
      TotMonth12 +=  parseInt(k.Profitto)
      break;
  }
}
function ResetVar2(){
  TotWeek1 = 0
  TotWeek2 = 0
  TotWeek3 = 0
  TotWeek4 = 0
  TotWeek5 = 0
}
function ResetVar(){
  TotMonth1 = 0
  TotMonth2 = 0
  TotMonth3 = 0
  TotMonth4 = 0
  TotMonth5 = 0
  TotMonth6 = 0
  TotMonth7 = 0
  TotMonth8 = 0
  TotMonth9 = 0
  TotMonth10 = 0
  TotMonth11 = 0
  TotMonth12 = 0
}

function SetWeekProfit(k){
  switch(true){
    case parseInt(k.Giorno) < 8 :
      TotWeek1 += k.Profitto
      break;
    case parseInt(k.Giorno) < 15:
      TotWeek2 += k.Profitto
      break;
    case parseInt(k.Giorno) < 22:
      TotWeek3 += k.Profitto
      break;
    case parseInt(k.Giorno) < 31:
      TotWeek4 += k.Profitto
      break;
    case parseInt(k.Giorno) > 30:
      TotWeek5 += k.Profitto
      break;
    default:
      console.log("Non entra nello switch")
      break;
  }
}

ipcMain.on("CreateWindow",(event,arg) => {
  CreateWindow(arg)
})

async function CreateWindow(arg){
  var WindowRegister = new BrowserWindow({width:1000,height:800,show: false,frame: true,webPreferences: {
    zoomFactor: 1.0
  }})
  WindowRegister.loadURL(arg)
  await sleep(500)
  WindowRegister.removeMenu()
  WindowRegister.show()
}

ipcMain.on("RequestedShoeDetailsServer",async (event,arg) => {
  console.log(arg)
  //console.log("RICHIESTA DETTAGLI DA SERVER DIO BESTIA")
  /*stockX.fetchProductDetails('https://stockx.com/' + arg)
  .then(product => (console.log(product),event.sender.send("ReturnedProductDetails",product)))
  .catch(err => console.log(`Error scraping product details: ${err.message}`),event.sender.send("ErrorFoundResearch",err));*/
  var res1 = await got("https://www.boringio.com:5001/GetDetails/Url=" + arg)
  console.log(res1.body)
  event.sender.send("ReturnedProductDetailsServer",res1.body)
})


autoUpdater.on("checking-for-update", () =>{
  console.log("Checking for updates")
})
autoUpdater.on("update-available", () =>{
  console.log("Update available")
})
autoUpdater.on("update-not-available", () =>{
  console.log("Update not available")
})
autoUpdater.on("error", err => {
  console.log(err.toString())
})