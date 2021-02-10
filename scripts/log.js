var mysql = require("mysql");
var moment = require("moment");
const fs = require("fs");
const path = require("path");
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

  return "<div class='card-body fs--1 p-0' style='background-color: #0A0A50 !important;'>" +
      "<a class='border-bottom-0 notification rounded-0 border-x-0 border border-300' style='background-color: #0A0A50 !important'>" +
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