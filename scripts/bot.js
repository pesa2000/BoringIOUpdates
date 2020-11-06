var mysql = require("mysql");
var moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
var config = require("electron").remote.getGlobal("configuration");
var connection = require("electron").remote.getGlobal("conn");
const app = require("electron").remote.app
var UserId = 0;
var Bots = [];
var ArrBotBrand = [];
var LOCAL_MODE = true;
var BotFile = ""
var data =""

var DirectoryBot = app.getPath("userData")
console.log("Directory Bot")
console.log(DirectoryBot)

window.setInterval(CheckConnection,5000)
console.log(BotFile);

function minimize() {
  ipc.send("Minimize");
}
function maximize() {
  ipc.send("Maximize");
}
function quit() {
  ipc.send("AppQuit");
}


function GetTodaysDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;
  return today;
}

function ContainsBrand(BrandCompleteName){
    for(var SingleBrand of ArrBotBrand){
        if(SingleBrand.BrandBeautify == BrandCompleteName){   
            return true
        }
    }
    return false
}

function LoadBots() {
  if (fs.existsSync(path.join(DirectoryBot,"/BotKeys.json"))) {
    console.log("Reading files");
    data = fs.readFileSync(path.join(DirectoryBot, "/BotKeys.json"), "utf8");
    console.log(data)
    ipc.send("getUserId");
    ipc.on("ReturnedId", async (event, arg) => {
      console.log(arg);
      try{
        BotFile = JSON.parse(data);
        console.log(BotFile)
      }catch(err){
        console.log(err)
        BotFile = { BotsList: []}
      }
      if(data != ""){
        console.log(BotFile)
        for (var BotLoaded of BotFile.BotsList) {
            //console.log(BotLoaded);
            var obj = {
                BrandBeautify: BotLoaded.BotBrandToPrint, 
                Brand: BotLoaded.BotBrand
            }
            if(ContainsBrand(BotLoaded.BotBrandToPrint) == false){ ArrBotBrand.push(obj)}
          }
          for (var Single of ArrBotBrand) {
            document.getElementById("TableBots").innerHTML += Create(Single.BrandBeautify,Single.Brand);
          }
          console.log(ArrBotBrand);
          $("#Preloader1").css("display", "none");
      }else{
        $("#Preloader1").css("display", "none");
        console.log("No Bots Loaded")
      }
    }); 
  }else{
    var BotFileToWrite = {BotsList:[]}
    fs.writeFile(path.join(DirectoryBot,"/BotKeys.json"),JSON.stringify(BotFileToWrite),() =>{
      console.log("File Creato")
    })
  }
}

function Create(BotBrand,val) {
  return (
    "<div class='mb-4 col-md-6 col-lg-4' onclick = " +
    `DetailsBrand("${val}")` +
    ">" +
    "<div class='card-body' style='background-color: #132238;border-radius: 4px;cursor: pointer;'>" +
    "<div class='row justify-content-between align-items-center'>" +
    "<div class='col'>" +
    "<div class='media'>" +
    "<div class='mr-2'>" +
    `<img src="https://www.boringio.com/src/assets/images/${val}.png" style='width: 60px;border-radius: .25rem !important;'>` +
    "</div>" +
    "<div class='media-body fs--1'>" +
    `<h6 class='fs-0'>${BotBrand}</h6>` +
    "<span class='fas fa-eye' style = 'float: right; margin-top: 20px; margin-right: 15px;'></span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

function DetailsBrand(Brand) {
    var Arr = ArrBotBrand.filter((e) => {
        return e.Brand == Brand
    })

    console.log(Arr)
  $("#botList").modal("toggle");
  $("#description").text(`All your keys for ${Arr[0].BrandBeautify} are stored here `);

  var FilteredArr = BotFile.BotsList.filter((e) => {
    return e.BotBrand == Brand;
  });

  console.log(FilteredArr);
  document.getElementById("keysList").innerHTML = "";
  for (var Bot of FilteredArr) {
    document.getElementById("keysList").innerHTML +=
    "<div class='form-group col-12'>" +
    `<label for='modal-auth-confirm-password'><span class="badge badge-soft-success rounded-capsule">${Bot.Created}</span><span class='badge badge-soft-danger rounded-capsule' style='float:right; margin-left:7px; cursor: pointer;' onclick='DeleteBot("${Bot.BotKey}")'>`+"Delete" +"</span></label>" +
    "<h4>" +
    Bot.BotKey + 
    "</h4>" +
    "</div>";
  }
  console.log(Brand);
}

function DeleteBot(Key){
  console.log(Key)
  for(var i = 0; i < BotFile.BotsList.length; i++){
    if(BotFile.BotsList[i].BotKey == Key){
      BotFile.BotsList.splice(i,1)
      fs.writeFileSync(path.join(DirectoryBot, "/BotKeys.json"),JSON.stringify(BotFile),"utf8")
      location.reload()
    }
  }
}

function AddBot() {
  var Status = CheckValues();
  console.log(Status);
  if (Status == true) {
    var Obj = {
      BotBrand: $("#BotBrandList").val(),
      BotBrandToPrint: $("#BotBrandList option:selected").text(),
      BotKey: $("#BotKey").val(),
      Created: GetTodaysDate(),
    };
    BotFile.BotsList.push(Obj);
    console.log(BotFile)
    fs.writeFileSync(path.join(DirectoryBot,"/BotKeys.json"),JSON.stringify(BotFile),"utf8")
    CreateLog(`Added a new ${$("#BotBrandList option:selected").text()} bot `,"Bot","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
    location.reload()
  } else {
    $("#errorLabel").text(Status);
  }
}
function CheckValues() {
  var ErrorCreated = "";
  if ($("#BotBrandList").val() == null) {
    ErrorCreated = "Select a Bot before continue ";
    return ErrorCreated;
  }
  if ($("#BotKey").val().length == 0) {
    ErrorCreated = "The field 'Bot Key' cannot be empty ";
    return ErrorCreated;
  }
  return true;
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
}

ipc.on("CheckedConnection", (event,arg) =>{
  console.log(arg)
})