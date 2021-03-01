var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var path = require('path')
var UserId = require('electron').remote.getGlobal('UserId')
var JwtToken = require('electron').remote.getGlobal('JwtToken')
var Currency = require('electron').remote.getGlobal('Valuta')
var BotsList = []

function minimize(){
  ipc.send("Minimize")
}
function maximize(){
  ipc.send("Maximize")
}
function quit(){
  ipc.send("AppQuit")
}

$(function(){
  //GetValutaAsUtf8(UserId)
  LoadBots()
})

async function LoadBots(){
  fetch("https://www.boringio.com:9005/GetBotsList",{
      method: 'POST',
      body: "",
      headers: {
          'Content-Type': 'application/json',
          "Authorization": JwtToken
      },
      referrer: 'no-referrer'
  }).then(function (response) {
      console.log(response.status)
      if(response.ok){
        return response.json()
      } else {
        window.alert("Something went wrong")
      }
  }).then(async function(data){
      console.log(data)
      $("#BotsPurchases").text(Currency + " " + data.Results3[0].Acquisti)
      $("#BotsSold").text(Currency + " " + data.Results3[0].Vendite)
      $("#NumberOfBots").text(data.Results3[0].Conteggio)
      $("#ProfitBots").text(Currency + " " + (data.Results3[0].Vendite - data.Results3[0].Acquisti))
      BotsList = data.Results2
      for(var Bot of data.Results2){
        var Element = SingleTemplateBot(Bot.BrandBot,Bot.ImmagineBot,Bot.PrezzoComprato,Bot.PrezzoVenduto,Bot.Note,Bot.IdBot)
        $("#Bots").append(Element)
      }
      for(var Bot of data.Results1){
        $('#BotsList').append(`<option value="${Bot.ImmagineBot}"> ${Bot.NomeBot} </option>`);
      }
      $("#Preloader1").css("display","none")
  }) 
}

function SingleTemplateBot(Brand,Immagine,Prezzo,Vendita,Note,Id){
  if(Note == null){
    Note = "No notes"
  }
  console.log(Immagine)
  return (
    `<tr>` +
        "<td>" +
        `<div class="media align-items-center mb-3">
        <div class="avatar avatar-2xl">
          <img class="rounded-circle" src="${Immagine}" alt="" />
        </div>
        <div class="media-body ml-3">
          <h6 class="mb-0 font-weight-semi-bold"><a class="text-900">${Brand}</a></h6>
        </div>
      </div>` +
      "</td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Currency + " " + Prezzo +"</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Currency + " " + Vendita +"</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Note+"</span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEditBot(" + Id +")'>" +
                "<span class='fas fa-tags' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'DeleteBot("+ Id +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
  )
}

function AddBot(){
  var Purc = $("#PricePurchaseBots").val()
  var Sold = $("#PriceSoldBots").val()
  var Notes = $("#NotesBots").val()
  var Brand = $("#BotsList option:selected").text()
  var Img = $("#BotsList").val()
  console.log(Brand)
  console.log(Img)
  if(Img == undefined || Img == null){
    $("#errorBotModal").text("Select a bot first!")
    return
  }
  if(isNaN(Purc)){
    $("#errorBotModal").text("The field 'Price purchase' must be a number!")
    return 
  }
  if(isNaN(Sold)){
    if(Sold == ""){
      Sold = 0
    }else{
      $("#errorBotModal").text("The field 'Price sold' must be a number!")
      return 
    }
  }
  var Values = [Brand,Img,Purc,Sold,Notes]
  fetch("https://www.boringio.com:9005/AddBot",{
      method: 'POST',
      body: JSON.stringify({Values:Values}),
      headers: {
          'Content-Type': 'application/json',
          "Authorization": JwtToken
      },
      referrer: 'no-referrer'
  }).then(function (response) {
      console.log(response.status)
      if(response.ok){
        window.location.reload()
      } else {
        window.alert("Something went wrong")
      }
  }).then(async function(data){

  }) 
}

function PrepareEditBot(IdBot){
  var Chosen = BotsList.filter((Bot,Index)=>{
    if(Bot.IdBot == IdBot){
      return Bot
    }
  })
  $("#PricePurchaseToModify").val(Chosen[0].PrezzoComprato)
  $("#PriceSoldToModify").val(Chosen[0].PrezzoVenduto)
  $("#NotesToModify").val(Chosen[0].Note)
  $("#IdToModify").val(Chosen[0].IdBot)
  $("#editBot").modal("toggle")
}

function EditBot(){
  var IdToModify = $("#IdToModify").val()
  var Purc = $("#PricePurchaseToModify").val()
  var Sold = $("#PriceSoldToModify").val()
  var Notes = $("#NotesToModify").val()
  if(isNaN(Purc)){
    $("#errorBotModalEdit").text("The field 'Price purchase' must be a number!")
    return 
  }
  if(isNaN(Sold)){
    $("#errorBotModalEdit").text("The field 'Price sold' must be a number!")
    if(Sold == "" || Sold == undefined || Sold == null){
      Sold = 0
    }else{
      return 
    }
  }
  var Values = [Purc,Sold,Notes,IdToModify]
  fetch("https://www.boringio.com:9005/EditBot",{
      method: 'POST',
      body: JSON.stringify({Values:Values}),
      headers: {
          'Content-Type': 'application/json',
          "Authorization": JwtToken
      },
      referrer: 'no-referrer'
  }).then(function (response) {
      console.log(response.status)
      if(response.ok){
        window.location.reload()
      } else {
        window.alert("Something went wrong")
      }
  }).then(async function(data){

  })
}

function DeleteBot(IdBot){
  fetch("https://www.boringio.com:9005/DeleteBot",{
      method: 'POST',
      body: JSON.stringify({IdBot: IdBot}),
      headers: {
          'Content-Type': 'application/json',
          "Authorization": JwtToken
      },
      referrer: 'no-referrer'
  }).then(function (response) {
      console.log(response.status)
      if(response.ok){
        window.location.reload()
      } else {
        window.alert("Something went wrong")
      }
  }).then(async function(data){

  })
}


document.getElementById("ExportButton").addEventListener("click",() => {
  ExportBots()
})

function ExportBots(){
  console.log("Exporting")
  ipc.send("RequestedExportBots")
}
