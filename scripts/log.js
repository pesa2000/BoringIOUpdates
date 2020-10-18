var mysql = require("mysql");
var moment = require("moment");
const fs = require("fs");
const path = require("path");
var config = require("electron").remote.getGlobal("configuration");
var connection = require("electron").remote.getGlobal("conn");
const app = require("electron").remote.app

var LogDirectory = app.getPath("userData")

function minimize(){
  ipc.send("Minimize")
}
function maximize(){
  ipc.send("Maximize")
}
function quit(){
  ipc.send("AppQuit")
}

var LogFile = ""

window.setInterval(CheckConnection,5000)


function LoadLogs(){
    var FileContentLog = fs.readFileSync(path.join(LogDirectory, "/LogMessage.json"), "utf8");
    LogFile = JSON.parse(FileContentLog)
    /*document.getElementById("TableLogs").innerHTML = `<div class="row no-gutters rounded-soft px-card py-2 mt-2 mb-3">` +
    `<div class="col d-flex align-items-center">` +
    `<h5 class="mb-0"></h5>` +
    "</div>" +
    `<div class="col-auto d-flex">`+
    `<button class="btn btn-sm btn-falcon-default mr-2 d-none d-md-block" onclick="ClearLog()"><span class="fas fa-chart-bar mr-2"></span>Clear Logs</button>` +
    "</div>" +
  "</div>"*/
    LogFile.Logs.reverse()
    for(var Log of LogFile.Logs){
        console.log(Log)
        document.getElementById("TableLogs").innerHTML += CreateSingleLog(Log.Message,Log.Action,Log.Section,Log.DateTime)
    }
    $("#Preloader1").css("display","none")
}

function CreateSingleLog(Description,Action,Section,Date){
  var icon = ""
  switch(Action){
    case "Delete":
      icon = "<i class = 'icon-trash_can icon-delete'></i>"
      break;
    case "Edit":
      icon = "<i class = 'icon-pen icon-edit'></i>"
      break;
    case "Add":
      icon = "<i class = 'icon-plus icon-new'></i>"
      break;
    case "Duplicate":
        icon = "<i class = 'icon-reorder_square icon-duplicate'></i>"
      break;
    case "Sold":
      icon = "<i class = 'icon-label icon-sold'></i>"
      break;
    case "Search":
      icon = "<i class = 'icon-magnifying icon-search'></i>"
      break;
    case "Error":
      icon = "<i class = 'icon-warning icon-error'></i>"
      break;
    case "Connection Error":
      icon = "<i class = 'icon-chart_alt icon-connection'></i>"
      break;
    case "Synchronizing":
      icon = "<i class = 'icon-refresh icon-sync'></i>"
      break;
  }

  return "<div class='card-body fs--1 p-0'>" +
      "<a class='border-bottom-0 notification rounded-0 border-x-0 border border-300'>" +
        "<div class='notification-avatar'>" +
          "<div class='avatar avatar-xl mr-3'>"+
            "<div class='avatar-emoji rounded-circle '><span role='img' aria-label='Emoji'>"+icon+"</span></div>" +
          "</div>" +
        "</div>" +
        "<div class='notification-body'>" +
          "<p class='mb-1'><strong>" + Description + "</strong></p>"+
          "<span class='notification-time'>" + Date +"</span>" +
        "</div>" +
      "</a>" +
    "</div>"
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

function ClearLog(){
  LogFile.Logs.length = 0
  fs.writeFileSync(path.join(LogDirectory,"/LogMessage.json"),JSON.stringify(LogFile),"utf8")
  location.reload()
}