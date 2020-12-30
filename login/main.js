//@ts-ignore
const remote1 = require("electron").remote
var Dialog = require("electron").dialog
var WinUpdate
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
var AccountSettingsDirectory = path.join(AppDataDir,"ClientSettings.json")
console.log(AccountSavedDirectory)
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
const isPackaged = require('electron-is-packaged').isPackaged

var internetAvailable = require("internet-available");

const Util = require(path.join(__dirname,"../utilityScripts/query_graphs_expenses.js"))

var UserSettings = {
  posX: 120,
  posY: 0,
  width: 1600,
  height: 1200
}

function GetTodaysMonth(){
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0')
  var yyyy = today.getFullYear()
  today = yyyy + '_' + mm + '_' + dd;
  return mm
}

var FilterMonth = "Lifetime"

var DEBUGGER_MODE

const Logger = require("electron-log")
const { dialog } = require("electron")
autoUpdater.logger = Logger
autoUpdater.logger.transports.file.level = "debug"

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
  if(fs.existsSync(AccountSettingsDirectory)){
    console.log("Il file delle impostazioni esiste")
    var Set = fs.readFileSync(AccountSettingsDirectory,{encoding: "utf-8"})
    UserSettings = JSON.parse(Set)
    console.log(UserSettings)
  }else{
    fs.writeFile(AccountSettingsDirectory,JSON.stringify(UserSettings),() =>{
      console.log("File Creato")
    })
  }
  if(isPackaged == true){
    console.log("Is Packaged")
    DEBUGGER_MODE = false
    autoUpdater.checkForUpdatesAndNotify()
  }else{
    console.log("Is not Packaged")
    DEBUGGER_MODE = true
    createWindows()
  }
}

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

const stockX = new StockxAPI();
var connection
var config = {
  waitForConnections : true,
  connectionLimit: 100,
  host     : 'www.boringio.com',
  user     : 'desktopuser',
  password : 'anfi1812',
  database : 'gestionaleprodotti'
}
var pool = mysql.createPool(config)
global.configuration = config
global.pool = pool
var SelectedTheme = ""

let win
let child

let win1
let child1

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
  fs.readFile(AccountSavedDirectory, async function (err, data) {
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
        var Data = {
          Username: UsernameSaved,
          Password: PasswordSaved,
          CryptedPass: true
        }
        fetch('https://www.boringio.com:5035/DesktopAppAuth',{
          method: 'POST',
          body: JSON.stringify(Data),
          headers: {
            'Content-Type': 'application/json'
          },
          referrer: 'no-referrer'
        }).then(function (response) {
          if(response.ok){
            return response.json();
          } else {
            return Promise.reject(response);
          }
        }).then(async function (data) {
          console.log(data)
          if(data.Code == 1){
            LOGGEDIN = true
            setUserId(data.Profile.UserId)
            setUserIdAttached(data.Profile.AccountAttached)
            setUsername(data.Profile.Username)
            setEmail(data.Profile.Email)
            setRenew(data.Profile.TypeSubscription)
            setRenewDays(data.Profile.NextDate)
            setImg(data.Profile.Immagine)
            setValuta(data.Profile.Valuta)

            GlobalIdUtente = data.Profile.UserId

            win = new BrowserWindow(
              {
                width:UserSettings.width,
                height:UserSettings.height,
                x: UserSettings.posX,
                y: UserSettings.posY,
                show: false,
                frame: false,
                webPreferences: {
                  enableRemoteModule: true,
                  nodeIntegration: true,
                  zoomFactor: 1.0
                }
              }
            )
            win.removeMenu()
            win.loadURL(url.format({
              pathname:path.join(__dirname,'../home.html'),
              protocol:'file',
              slashes:true
            }))
            win.webContents.setZoomFactor(0.9)
            if(DEBUGGER_MODE){
              win.webContents.openDevTools()
            }
            win.once('ready-to-show', () => {
              win.show()
            })
            windowStats = new BrowserWindow(
              {
                width:800,
                height:700,
                show: false,
                frame: true,
                webPreferences: {
                  enableRemoteModule: true,
                  nodeIntegration: true,
                  zoomFactor: 1.0
                }
              }
            )
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
            LOGGEDIN = false
            win = new BrowserWindow(
              {
                width:1600,
                height:1200,
                show: false,
                frame: false,
                webPreferences: {
                  enableRemoteModule: true,
                  nodeIntegration: true,
                  zoomFactor: 1.0
                }
              }
            )
            child = new BrowserWindow(
              {
                parent: win,
                width:800,
                height:700,
                show: false,
                frame: false,
                webPreferences: {
                  enableRemoteModule: true,
                  nodeIntegration: true
                }
              }
            )
            child.removeMenu()
            child.loadURL(url.format({
              pathname:path.join(__dirname,'login.html'),
              protocol:'file',
              slashes:true
            }))
            child.show()
            if(DEBUGGER_MODE){
              child.webContents.openDevTools()
            }
          }

        }).catch(function (err) {
          console.warn('Something went wrong.', err);
        });   
      }else{
        LOGGEDIN = false
        win = new BrowserWindow(
          {
            width:1600,
            height:1200,
            show: false,
            frame: false,
            webPreferences: {
              enableRemoteModule: true,
              nodeIntegration: true,
              zoomFactor: 1.0
            }
          }
        )
        child = new BrowserWindow(
          {
            parent: win,
            width:800,
            height:800,
            show: false,
            frame: false,
            webPreferences: {
              enableRemoteModule: true,
              nodeIntegration: true
            }
          }
        )
        child.removeMenu()
        child.loadURL(url.format({
          pathname:path.join(__dirname,'login.html'),
          protocol:'file',
          slashes:true
        }))
        child.on("ready-to-show",()=>{
          console.log("Showing app")
          child.show()
        })
        if(DEBUGGER_MODE){
          child1.webContents.openDevTools()
        }
      }
  })
}
function setValuta(input){
  Valuta = input
  global.ValutaAcc = Valuta
}
function setUserIdAttached(input){
  global.UserIdAttached = input
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
  SetUserSettings()
  fs.writeFile(AccountSavedDirectory, "", function (err) {
    if (err) throw err;
    console.log('Saved!');
    app.exit()
  });
})

ipcMain.handle("setUserId", async(event,arg) => {
  console.log(arg)
  GlobalIdUtente = arg
  setUserId(arg)
})

ipcMain.handle("setAttachedInventory", async(event,arg) => {
  console.log(arg)
  setUserIdAttached(arg)
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

function SetUserSettings(){
  var pos = win.getPosition()
  var positionX = pos[0]
  var positionY = pos[1]
  var size = win.getSize()
  var width = size[0]
  var height = size[1]
  console.log(size)
  var UserSettings = {
    posX: positionX,
    posY: positionY,
    width: width,
    height: height
  }
  fs.writeFileSync(path.join(AccountSettingsDirectory),JSON.stringify(UserSettings),"utf8")
}

ipcMain.on('AppQuit',async (event,arg) => {
  event.preventDefault()
  SetUserSettings()
  app.exit()
})

ipcMain.on('close', async (event, arg) => {
  event.preventDefault()
  console.log("closing app triggered in the ipcMain.on")
  app.removeAllListeners()
  windowStats.quit()
  windowStats = null
})

ipcMain.on("WindowTracking",(event,arg) => {
  console.log("It should open another window")
  var WindowForTracking = new BrowserWindow(
    {
      width:800,
      height:600,
      show: false,
      frame: true
    }
  )
  WindowForTracking.loadURL(arg)
  WindowForTracking.show()
  WindowForTracking.removeMenu()
})

ipcMain.on("SearchProducts",(event,arg) => {
  stockX.newSearchProducts(arg, {
      limit: 5
  })
  .then(products => (/*console.log(products),*/event.sender.send("ReturnedProducts",products)))
  .catch(err => console.log(`Error searching: ${err.message}`));
})

ipcMain.on("RequestedShoeDetails",(event,arg) => {
  stockX.fetchProductDetails('https://stockx.com/' + arg.Prod)
  .then(product => {
    console.log(product)
    Logger.log(product)
    event.sender.send("ReturnedProductDetails",{Prod:product ,Index: arg.Index})})
  .catch(err => {
    console.log(`Error scraping product details: ${err.message}`)
    Logger.error(err.message)
    event.sender.send("ErrorFoundResearch",{err:err.message,lastArg:arg})
  });
})

ipcMain.on("RequestedShoeDetailsArray",async (event,arg) => {
  var ArrRes = []
  var Res = ""
  var k = 1
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
    event.sender.send("NewSyncReceived",k)
    k+=1
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
  ObjLog.Message = Username + " " + ObjLog.Message
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

let FileSavesOption = {
  title: "Save your exported inventory",
  defaultPath: app.getPath("desktop"),
  buttonLabel: "Save Inventory",
  filters:[
    {name:"Json File",extensions:["json"]},
    {name:"Txt File",extensions:["txt"]},
    {name:"Csv File",extensions:["csv"]}
  ]
}

ipcMain.on("RequestedExportInventory",async (event,arg) => {
  var Path = await dialog.showSaveDialog(win,FileSavesOption)
  console.log(Path)
  if(Path.canceled == false){
    console.log("ExportRequested")
    var TotalInventory = {Full_Inventory:[]}
    var Inventory = {Inventory:[]}
    var InventoryCustom = {Inventory_Custom:[]}
    var Query = "SELECT * FROM inventario WHERE IdUtente like ? AND QuantitaAttuale = 1"
    pool.getConnection(function(err,connection){
      connection.query(Query,userId,function(error,results){
      connection.release()
      if(error) console.log(error)
      var StockXInv = results
        connection.query("SELECT * FROM inventariocustom WHERE IdUtente like ? AND QuantitaAttuale = 1",UserId,function(error,results){
          if(error) console.log(error)
          var CustomInv = results
          if(Path.filePath.includes(".json")){
            for(var i = 0; i < StockXInv.length; i++){
              var SingleItem = {
                "Type":"StockX Item",
                "Product Name":StockXInv[i].NomeProdotto,
                "Price": StockXInv[i].PrezzoProdotto,
                "Release Date" : StockXInv[i].ReleaseDate,
                "Value": StockXInv[i].PrezzoMedioResell,
                "Size": StockXInv[i].Taglia,
                "Notes": StockXInv[i].Note
              }
              Inventory.Inventory.push(SingleItem)
            }
            for(var i = 0; i < CustomInv.length; i++){
              var SingleItemCustom = {
                "Type":"Custom Item",
                "Product Name":CustomInv[i].NomeProdotto,
                "Price": CustomInv[i].PrezzoProdotto,
                "Release Date" : CustomInv[i].ReleaseDate,
                "Size": CustomInv[i].Taglia,
                "Notes": CustomInv[i].Note
              }
              InventoryCustom.Inventory_Custom.push(SingleItemCustom)
            }
            TotalInventory.Full_Inventory.push(Inventory)
            TotalInventory.Full_Inventory.push(InventoryCustom)
            fs.writeFileSync(path.join(Path.filePath),JSON.stringify(TotalInventory,null,4),() => {console.log("Writing new file")})
          }
          if(Path.filePath.includes(".txt")){
            var Txt = "Type Name Price Release-Date Added Size Notes \n"
            for(var i = 0; i < StockXInv.length; i++){
              Txt += "StockX Item " + StockXInv[i].NomeProdotto + " " + StockXInv[i].PrezzoProdotto + " " + StockXInv[i].ReleaseDate + " " + StockXInv[i].PrezzoMedioResell + " " +StockXInv[i].Taglia + "\n"
            }
            for(var i = 0; i < CustomInv.length; i++){
              Txt += "Custom Item " + CustomInv[i].NomeProdotto + " " + CustomInv[i].PrezzoProdotto + " " + CustomInv[i].ReleaseDate + " " + CustomInv[i].PrezzoMedioResell + " " +CustomInv[i].Taglia + "\n"
            }
            fs.writeFileSync(path.join(Path.filePath),Txt,() => {console.log("Writing new file")})
          }
          if(Path.filePath.includes(".csv")){
            var Csv = "Type;Name;Price;Release Date;Added;Size;Notes \n"
            for(var i = 0; i < StockXInv.length; i++){
              Csv += "StockX Item;" + StockXInv[i].NomeProdotto + ";" + StockXInv[i].PrezzoProdotto + ";" + StockXInv[i].ReleaseDate + ";" +StockXInv[i].Taglia + "\n"
            }
            for(var i = 0; i < CustomInv.length; i++){
              Csv += "Custom Item;" + CustomInv[i].NomeProdotto + ";" + CustomInv[i].PrezzoProdotto + ";" + CustomInv[i].ReleaseDate + ";" +CustomInv[i].Taglia + "\n"
            }
            fs.writeFileSync(path.join(Path.filePath),Csv,() => {console.log("Writing new file")})
          }
        })  
      })
    })
  }else{
    console.log("Non hai salvato il file")
  }
  //fs.writeFileSync(path.join(FullPath),JSON.stringify(TotalInventorySold),() => {console.log("Writing new file")})
})

ipcMain.on("RequestedExportInventorySold",async (event,arg) => {
  try {
    var Path = await dialog.showSaveDialog(win,FileSavesOption)
    console.log(Path)
    if(Path.canceled == false){
      console.log("ExportRequested")
      var TotalInventorySold = {Full_Inventory_Sold:[]}
      var InventorySold = {Inventory_Sold:[]}
      var InventoryCustomSold = {Inventory_Custom_Sold:[]}
      var Query = "SELECT * FROM inventario WHERE IdUtente like ? AND QuantitaAttuale = 0"
      pool.getConnection(function(err,connection){
        connection.query(Query,userId,function(error,results){
        if(error) console.log(error)
        var InventorySoldRes = results
          connection.query("SELECT * FROM inventariocustom WHERE IdUtente like ? AND QuantitaAttuale = 0",UserId,function(error,results){
            if(error) console.log(error)
            connection.release()
            var InvetoryCustomSoldRes = results
            if(Path.filePath.includes(".json")){
              for(var i = 0; i < InventorySoldRes.length; i++){
                var SingleItem = {
                  "Type":"StockX Item",
                  "Product Name":InventorySoldRes[i].NomeProdotto,
                  "Purchase Price": InventorySoldRes[i].PrezzoProdotto, 
                  "Sold Price": InventorySoldRes[i].PrezzoVendita, 
                  "Profit": InventorySoldRes[i].Profitto ,
                  "Value": InventorySoldRes[i].PrezzoMedioResell,
                  "Date Sold": InventorySoldRes[i].DataVendita,
                  "Site": InventorySoldRes[i].Sito,
                  "Buyer": InventorySoldRes[i].Compratore,
                  "Size": InventorySoldRes[i].Taglia,
                  "Notes": InventorySoldRes[i].Note,
                }
                InventorySold.Inventory_Sold.push(SingleItem)
              }
              for(var i = 0; i < InvetoryCustomSoldRes.length; i++){
                var SingleItem = {
                  "Type":"Custom Item",
                  "Product Name":InventorySoldRes[i].NomeProdotto,
                  "Purchase Price": InventorySoldRes[i].PrezzoProdotto, 
                  "Sold Price": InventorySoldRes[i].PrezzoVendita, 
                  "Profit": InventorySoldRes[i].Profitto ,
                  "Date Sold": InventorySoldRes[i].DataVendita,
                  "Site": InventorySoldRes[i].Sito,
                  "Buyer": InventorySoldRes[i].Compratore,
                  "Size": InventorySoldRes[i].Taglia,
                  "Notes": InventorySoldRes[i].Note,
                }
                InventoryCustomSold.Inventory_Custom_Sold.push(SingleItemCustom)
              }
              TotalInventorySold.Full_Inventory_Sold.push(InventorySold)
              TotalInventorySold.Full_Inventory_Sold.push(InventoryCustomSold)
              fs.writeFileSync(path.join(Path.filePath),JSON.stringify(TotalInventorySold,null,4),() => {console.log("Writing new file")})
            }
            if(Path.filePath.includes(".txt")){
              for(var i = 0; i < InventorySoldRes.length; i++){
                Txt += "StockX Item " + InventorySoldRes[i].NomeProdotto + " " + InventorySoldRes[i].PrezzoProdotto + " " + InventorySoldRes[i].PrezzoVendita  + " " +InventorySoldRes[i].Profitto + " " + InvetoryCustomSoldRes[i].PrezzoMedioResell + " " + InvetoryCustomSoldRes[i].DataVendita + " " + InvetoryCustomSoldRes[i].Sito + " " + InvetoryCustomSoldRes[i].Compratore+ " " + InvetoryCustomSoldRes[i].Taglia + " " +InventorySoldRes[i].Note +"\n"
              }
              for(var i = 0; i < InvetoryCustomSoldRes.length; i++){
                Txt += "Custom Item " + InvetoryCustomSoldRes[i].NomeProdotto + " " + InvetoryCustomSoldRes[i].PrezzoProdotto + " " + InvetoryCustomSoldRes[i].PrezzoVendita + " " +InventorySoldRes[i].Profitto + " " + 0 + " " +InvetoryCustomSoldRes[i].DataVendita + " " + InvetoryCustomSoldRes[i].Sito + " " + InvetoryCustomSoldRes[i].Compratore + " " +InvetoryCustomSoldRes[i].Taglia + " " +InvetoryCustomSoldRes[i].Note +"\n"
              }
              fs.writeFileSync(path.join(Path.filePath),Txt,() => {console.log("Writing new file")})
            }
            if(Path.filePath.includes(".csv")){
              var Csv = "Type;Name;Product Price;Sold Price;Profit;Resell value;Date Sold;Site;Buyer;Size;Notes \n"
              for(var i = 0; i < InventorySoldRes.length; i++){
                Csv += "StockX Item;" + InventorySoldRes[i].NomeProdotto + ";" + InventorySoldRes[i].PrezzoProdotto + ";" + InventorySoldRes[i].PrezzoVendita  + ";" +InventorySoldRes[i].Profitto + ";" + InvetoryCustomSoldRes[i].PrezzoMedioResell + ";" + InvetoryCustomSoldRes[i].DataVendita + ";" + InvetoryCustomSoldRes[i].Sito + ";" + InvetoryCustomSoldRes[i].Compratore+ ";" + InvetoryCustomSoldRes[i].Taglia + ";" +InventorySoldRes[i].Note +"\n"
              }
              for(var i = 0; i < InvetoryCustomSoldRes.length; i++){
                Csv += "Custom Item;" + InvetoryCustomSoldRes[i].NomeProdotto + ";" + InvetoryCustomSoldRes[i].PrezzoProdotto + ";" + InvetoryCustomSoldRes[i].PrezzoVendita + ";" +InventorySoldRes[i].Profitto + ";" + 0 + ";" +InvetoryCustomSoldRes[i].DataVendita + ";" + InvetoryCustomSoldRes[i].Sito + ";" + InvetoryCustomSoldRes[i].Compratore + ";" +InvetoryCustomSoldRes[i].Taglia + ";" +InvetoryCustomSoldRes[i].Note +"\n"
              }
              fs.writeFileSync(path.join(Path.filePath),Csv,() => {console.log("Writing new file")})
            }
            //fs.writeFileSync(path.join(Path.filePath),JSON.stringify(TotalInventorySold,null,4),() => {console.log("Writing new file")})
          })
        })
      })
    }else{
      console.log("Non hai salvato il file venduti")
    }
  }catch(err){
    Logger.log(err)
  }
})

ipcMain.on("CheckStripe",async (event,arg) => {
  await CheckStripeBeforeStart(arg)
  event.sender.send("ReturnedStripeLogin",BOUGHT)
})

async function CheckStripeBeforeStart(User1){
  await fetch("https://www.boringio.com:5001/CheckStripeUser", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({User:User1}) })
  .then(async res => res.json())
  .then(async json => {console.log(json.Res);await SetBought(json.Res)});
}

async function SetBought(res){
  BOUGHT = res
}

function ChangeDate(DateToChange){
  return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

ipcMain.on("ResetAlert",(event,arg) =>{
  LatestAlertInventory = "No Alert Yet"
  global.AlertInventory = LatestAlertInventory
})

ipcMain.on("ReturnStripeSub",async (event,arg) => {
  fetch("https://www.boringio.com:5001/GetSub", { method: 'POST',headers: {"Content-Type": "application/json"}, body:JSON.stringify({UserId:userId})})
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

var Tot = 0
var FinalArray = []
var ArrayYears = []
var ArrayProfit = [0,0,0,0,0,0,0,0,0,0,0]


function GetFormattedNumber(Number){
  var N = Number.toString().split(".")
  N[0] = N[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
  return N[0]
}

ipcMain.on("RequestedStats",async (event,arg) => {
  pool.getConnection(async function(err,connection){
    if(err)console.log(err)
    UserId = GlobalIdUtente
    GlobalFilter = arg.Filter
    var Url = ""
    var ObjToSend = {
      
    }
    if(GlobalFilter == "Year"){
      Url = "https://www.boringio.com:5666/GetHomepageStatsYearDesktop"
      ObjToSend = {
        UserId: UserId
      }
    }else if(GlobalFilter == "Lifetime"){
      Url = "https://www.boringio.com:5666/GetHomepageStatsLifetimeDesktop"
      ObjToSend = {
        UserId: UserId
      }
    }else{
      Url = "https://www.boringio.com:5666/GetHomepageStatsMonthDesktop"
      ObjToSend = {
        UserId: UserId,
        Month: GlobalFilter
      }
    }

    console.log(ObjToSend)
    var Response = await fetch(Url, {
      method: 'POST',
      headers: {
        "Access-Control-Request-Method" : "POST",
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(ObjToSend)
    });

    var Res = await Response.json()
    connection.release()
    event.sender.send("ReturnedStats",Res)
  })
})

var TotWeek1 = 0
var TotWeek2 = 0
var TotWeek3 = 0
var TotWeek4 = 0
var TotWeek5 = 0


var ArrayMonth = []
var ArrayYear = {
  2016: 0,
  2017: 0,
  2018: 0,
  2019: 0,
  2020: 0,
  2021: 0,
  2022: 0
}

ipcMain.on("RequestedDataGraphs", async(event,arg) => {
  var Url = ""
  var ObjToSend = ""
  pool.getConnection(function(err,connection){
    DATAGRAPHS = []
    ArrayYears = []
    FinalArray = []
    ArrayMonth = [0,0,0,0,0,0,0,0,0,0,0,0]
    if(FilterMonth == "Year"){
      ResetVarMonth()
      var Values = [GlobalIdUtente,GetNewDateYear()]
      var QueryCostiInv = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,Month(ReleaseDate) as Mese FROM inventario WHERE IdUtente = ? AND YEAR(ReleaseDate) = ?"
      var QueryCostiInvCustom = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,Month(ReleaseDate) as Mese FROM inventariocustom WHERE IdUtente = ? AND YEAR(ReleaseDate) = ?"
      var QueryRicaviInv = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,Month(DataVendita) as Mese FROM inventario WHERE IdUtente = ? AND YEAR(DataVendita) = ?"
      var QueryRicaviInvCustom = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,Month(DataVendita) as Mese FROM inventariocustom WHERE IdUtente = ? AND YEAR(DataVendita) = ?"
      connection.query(QueryCostiInv,Values,function(error,results1,fields){
        if(error)console.log(error)
        console.log(results1)
        connection.query(QueryCostiInvCustom,Values,function(error,results2,fields){
          if(error)console.log(error)
          console.log(results2)
          connection.query(QueryRicaviInv,Values,function(error,results3,fields){
            if(error)console.log(error)
            console.log(results3)
            connection.query(QueryRicaviInvCustom,Values,function(error,results4,fields){
              connection.release()
              console.log(results4)
              for(var k of results1){
                if(k.Mese != null){
                  //console.log("Set month")
                  SetMonthCosti(k)
                }
              }
              for(var k of results2){
                if(k.Mese != null){
                  //console.log("Set month")
                  SetMonthCosti(k)
                }
              }
              for(var k of results3){
                if(k.Mese != null){
                  //console.log("Set month")
                  SetMonthRicavi(k)
                }
              }
              for(var k of results4){
                if(k.Mese != null){
                  //console.log("Set month")
                  SetMonthRicavi(k)
                }
              }
              DATAGRAPHS.push({y: `Jan`, item1: ArrayMonth[0]})
              DATAGRAPHS.push({y: `Feb`, item1: ArrayMonth[1]})
              DATAGRAPHS.push({y: `Mar`, item1: ArrayMonth[2]})
              DATAGRAPHS.push({y: 'Apr', item1: ArrayMonth[3]})
              DATAGRAPHS.push({y: `May`, item1: ArrayMonth[4]})
              DATAGRAPHS.push({y: `Jun`, item1: ArrayMonth[5]})
              DATAGRAPHS.push({y: 'Jul', item1: ArrayMonth[6]})
              DATAGRAPHS.push({y: `Aug`, item1: ArrayMonth[7]})
              DATAGRAPHS.push({y: `Sep`, item1: ArrayMonth[8]})
              DATAGRAPHS.push({y: `Oct`, item1: ArrayMonth[9]})
              DATAGRAPHS.push({y: `Nov`, item1: ArrayMonth[10]})
              DATAGRAPHS.push({y: `Dec`, item1: ArrayMonth[11]})
              event.sender.send("ReturnedDataGraphsMorris",{DATAGRAPHS: DATAGRAPHS,FilterMonth: FilterMonth})
            })
          })
        })
      })
    }else if(FilterMonth == "Lifetime"){
      ArrayYear = {
        "2016": 0,
        "2017": 0,
        "2018": 0,
        "2019": 0,
        "2020": 0,
        "2021": 0,
        "2022": 0
      }
      var Values = GlobalIdUtente
      var QueryCostiInv = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,YEAR(ReleaseDate) as Anno FROM inventario WHERE IdUtente = ?"
      var QueryCostiInvCustom = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,YEAR(ReleaseDate) as Anno FROM inventariocustom WHERE IdUtente = ?"
      var QueryRicaviInv = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,YEAR(DataVendita) as Anno FROM inventario WHERE IdUtente = ?"
      var QueryRicaviInvCustom = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,YEAR(DataVendita) as Anno FROM inventariocustom WHERE IdUtente = ?"

      connection.query(QueryCostiInv,Values,function(error,results1,fields){
        if(error)console.log(error)
        console.log(results1)
        connection.query(QueryCostiInvCustom,Values,function(error,results2,fields){
          if(error)console.log(error)
          console.log(results2)
          connection.query(QueryRicaviInv,Values,function(error,results3,fields){
            if(error)console.log(error)
            console.log(results3)
            connection.query(QueryRicaviInvCustom,Values,function(error,results4,fields){
              connection.release()
              console.log(results4)
              for(var k of results1){
                if(k.Anno != null){
                  SetYearCosti(k)
                }
              }
              for(var k of results2){
                if(k.Anno != null){
                  SetYearCosti(k)
                }
              }
              for(var k of results3){
                if(k.Anno != null){
                  SetYearRicavi(k)
                }
              }
              for(var k of results4){
                if(k.Anno != null){
                  SetYearRicavi(k)
                }
              }
              DATAGRAPHS.push({y: "2016", item1: ArrayYear["2016"]})
              DATAGRAPHS.push({y: "2017", item1: ArrayYear["2017"]})
              DATAGRAPHS.push({y: "2018", item1: ArrayYear["2018"]})
              DATAGRAPHS.push({y: "2019", item1: ArrayYear["2019"]})
              DATAGRAPHS.push({y: "2020", item1: ArrayYear["2020"]})
              DATAGRAPHS.push({y: "2021", item1: ArrayYear["2021"]})
              DATAGRAPHS.push({y: "2022", item1: ArrayYear["2022"]})
              console.log(DATAGRAPHS)
              event.sender.send("ReturnedDataGraphsMorris",{DATAGRAPHS: DATAGRAPHS,FilterMonth: FilterMonth})
            })
          })
        })
      })
    }else{
      ResetVarWeek()
      var Values = [GlobalIdUtente,GetNewDateYear(),parseInt(FilterMonth)]
      var QueryCostiInv = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,Day(ReleaseDate) as Giorno FROM inventario WHERE IdUtente = ? AND YEAR(ReleaseDate) = ? AND MONTH(ReleaseDate) = ?"
      var QueryCostiInvCustom = "SELECT IFNULL(PrezzoProdotto,0) as PrezzoProdotto,Day(ReleaseDate) as Giorno FROM inventariocustom WHERE IdUtente = ? AND YEAR(ReleaseDate) = ? AND MONTH(ReleaseDate) = ?"
      var QueryRicaviInv = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,Day(DataVendita) as Giorno FROM inventario WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ?"
      var QueryRicaviInvCustom = "SELECT IFNULL(PrezzoVendita,0) as PrezzoVendita,Day(DataVendita) as Giorno FROM inventariocustom WHERE IdUtente = ? AND YEAR(DataVendita) = ? AND MONTH(DataVendita) = ?"
      connection.query(QueryCostiInv,Values,function(error,results1,fields){
        if(error)console.log(error)
        console.log(results1)
        connection.query(QueryCostiInvCustom,Values,function(error,results2,fields){
          if(error)console.log(error)
          console.log(results2)
          connection.query(QueryRicaviInv,Values,function(error,results3,fields){
            if(error)console.log(error)
            console.log(results3)
            connection.query(QueryRicaviInvCustom,Values,function(error,results4,fields){
              console.log(results4)
              connection.release()
              for(var k of results1){
                if(k.Giorno != null){
                  SetWeekCosti(k)
                }
              }
              for(var k of results2){
                if(k.Giorno != null){
                  SetWeekCosti(k)
                }
              }
              for(var k of results3){
                if(k.Giorno != null){
                  SetWeekRicavi(k)
                }
              }
              for(var k of results4){
                if(k.Giorno != null){
                  SetWeekRicavi(k)
                }
              }
              DATAGRAPHS.push({y: "Week 1", item1: TotWeek1})
              DATAGRAPHS.push({y: "Week 2", item1: TotWeek2})
              DATAGRAPHS.push({y: "Week 3", item1: TotWeek3})
              DATAGRAPHS.push({y: "Week 4", item1: TotWeek4})
              DATAGRAPHS.push({y: "Week 5", item1: TotWeek5})
              console.log(DATAGRAPHS)
              event.sender.send("ReturnedDataGraphsMorris",{DATAGRAPHS: DATAGRAPHS,FilterMonth: FilterMonth})
            })
          })
        })
      })
    }
  })
})

ipcMain.on("RequestedExpensesFetched",(event,arg) => {
  pool.getConnection(function(err,connection){
    console.log("Filtro selezionato per le spese: " + arg.Filter)
    connection.query("SELECT * FROM costi WHERE IdUtente = ? AND YEAR(DataCosto) <= ?",[GlobalIdUtente,GetNewDateYear()],  function (error, results, fields) {
      if(error) console.log(error)
      var Res = ""
      Res = Util.IterateResults(arg.Filter,results)
      console.log(Res)
      connection.release()
      event.sender.send("ReturnedExpensesFetched",{Res:Res})
    })
  })
})

function SetWeekRicavi(Shoe){
  console.log("Scarpa nei ricavi")
  console.log(Shoe)
  switch(true){
    case parseInt(Shoe.Giorno) < 8 :
      if(Shoe.PrezzoVendita >= 0){
        TotWeek1 += parseInt(Shoe.PrezzoVendita)
      }else{
        TotWeek1 -= parseInt(Shoe.PrezzoVendita)
      }
      break;
    case parseInt(Shoe.Giorno) < 15:
      if(Shoe.PrezzoVendita >= 0){
        TotWeek2 += parseInt(Shoe.PrezzoVendita)
      }else{
        TotWeek2 -= parseInt(Shoe.PrezzoVendita)
      }
      break;
    case parseInt(Shoe.Giorno) < 22:
      if(Shoe.PrezzoVendita >= 0){
        TotWeek3 += parseInt(Shoe.PrezzoVendita)
      }else{
        TotWeek3 -= parseInt(Shoe.PrezzoVendita)
      }
      break;
    case parseInt(Shoe.Giorno) < 31:
      if(Shoe.PrezzoVendita >= 0){
        TotWeek4 += parseInt(Shoe.PrezzoVendita)
      }else{
        TotWeek4 -= parseInt(Shoe.PrezzoVendita)
      }
      break;
    case parseInt(Shoe.Giorno) > 30:
      if(Shoe.PrezzoVendita >= 0){
        TotWeek5 += parseInt(Shoe.PrezzoVendita)
      }else{
        TotWeek5 -= parseInt(Shoe.PrezzoVendita)
      }
      break;  
    default:
        console.log("Non entra nello switch")
      break;
  }
}

function SetWeekCosti(Shoe){
  console.log("Scarpa nei costi")
  console.log(Shoe)
  switch(true){
    case parseInt(Shoe.Giorno) < 8:
        TotWeek1 -= parseInt(Shoe.PrezzoProdotto)
      break;
    case parseInt(Shoe.Giorno) < 15:
        TotWeek2 -= parseInt(Shoe.PrezzoProdotto)
      break;
    case parseInt(Shoe.Giorno) < 22:
        TotWeek3 -= parseInt(Shoe.PrezzoProdotto)
      break;
    case parseInt(Shoe.Giorno) < 31:
        TotWeek4 -= parseInt(Shoe.PrezzoProdotto)
      break;
    case parseInt(Shoe.Giorno) > 30:
        TotWeek5 -= parseInt(Shoe.PrezzoProdotto)
      break;
    default:
      console.log("Non entra nello switch")
      break;
  }
}

function SetMonthCosti(Shoe){
  ArrayMonth[Shoe.Mese - 1] -= Shoe.PrezzoProdotto
}

function SetMonthRicavi(Shoe){
  if(Shoe.PrezzoVendita >= 0){
    ArrayMonth[Shoe.Mese - 1] += Shoe.PrezzoVendita
  }else{
    ArrayMonth[Shoe.Mese - 1] -= Shoe.PrezzoVendita
  }
}

function SetYearCosti(Shoe){
  console.log(Shoe.Anno)
  ArrayYear[Shoe.Anno] -= Shoe.PrezzoProdotto
}

function SetYearRicavi(Shoe){
  if(Shoe.PrezzoVendita >= 0){
    ArrayYear[Shoe.Anno] += Shoe.PrezzoVendita
  }else{
    ArrayYear[Shoe.Anno] -= Shoe.PrezzoVendita
  }
} 

function ResetVarWeek(){
  TotWeek1 = 0
  TotWeek2 = 0
  TotWeek3 = 0
  TotWeek4 = 0
  TotWeek5 = 0
}

function ResetVarMonth(){
  ArrayMonth = [0,0,0,0,0,0,0,0,0,0,0,0]
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
  var res1 = await got("https://www.boringio.com:5001/GetDetails/Url=" + arg)
  console.log(res1.body)
  event.sender.send("ReturnedProductDetailsServer",res1.body)
})

autoUpdater.on("checking-for-update", () =>{
  console.log("Checking for updates")
})

autoUpdater.on("update-available", (info) => {
  Logger.log("New Update found in the main process")
  Logger.log(info)
  CreateUpdateWindows()
})

autoUpdater.on("update-not-available", () =>{
  Logger.log("This is the new version")
  createWindows()
})

async function CreateUpdateWindows(){
  var UpdateWin = new BrowserWindow({
    height: 500,
    width: 800,
    frame: false
  })
  UpdateWin.loadURL(url.format({
    pathname:path.join(__dirname,'../NewVersion.html'),
    protocol:'file',
    slashes:true
  }))
  UpdateWin.removeMenu()
  await sleep(1000)
  UpdateWin.show()
}

autoUpdater.on("error", err => {
  Logger.log("Error")
  Logger.log(err.toString())
})

autoUpdater.on('download-progress', (progress) => {
  Logger.log("Download progress")
  Logger.log(progress)
})

autoUpdater.on('update-downloaded', () => {
  Logger.log("Installing right now")
  autoUpdater.quitAndInstall()
})

ipcMain.on("StoreSavedMonthFilter",(event,arg)=>{
  FilterMonth = arg
})

ipcMain.on("RequestedMonthFilter",(event,arg)=>{
  console.log("Requested a new month filter from home.js")
  event.sender.send("ReturnedMonthFilter",FilterMonth)
})