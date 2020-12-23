var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var pool = require('electron').remote.getGlobal('pool')
console.log("All connections: " + pool._allConnections.length)
console.log("Free connections: " + pool._freeConnections.length)
console.log(pool)
var Valuta = require('electron').remote.getGlobal("ValutaAcc")
var path = require('path')
var Util = require(path.join(__dirname,"/utilityScripts/query_stats_inventory.js"))
var UtilCurr =  require(path.join(__dirname,"/utilityScripts/currency-conversion.js"))
var UserId = require('electron').remote.getGlobal('UserId')
var BotsList = []

function GetValutaAsUtf8(Id){
  console.log("Entrato nella funzione")
  Flag = true
  pool.getConnection(function(err,connection){
      connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
          if(error)console.log(error)
          console.log(results[0].Valuta1)
          Valuta = UtilCurr.GetCurrencyFromUTF8(results[0].Valuta1)
          console.log(Valuta)
          switch(Valuta){
              case "$":
                  Conversion = 1
              break;
              case "€":
                  Conversion = 0.86
              break;
              case "£":
                  Conversion = 0.78
              break;
          }
          console.log("Coversione valuta")
          console.log(Conversion)
          connection.release()
          LoadBots()
      })
  })
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

$(function(){
  GetValutaAsUtf8(UserId)
})

function LoadBots(){
  LoadStats()
  pool.getConnection(function(error,connection){
    connection.query("SELECT * FROM inventariobot WHERE IdUtente = ?",[UserId],function(err,results,fields){
      console.log(results)
      BotsList = results
      for(var Bot of results){
        var Element = SingleTemplateBot(Bot.BrandBot,Bot.ImmagineBot,Bot.PrezzoComprato,Bot.PrezzoVenduto,Bot.Note,Bot.IdBot)
        $("#Bots").append(Element)
      }
      $("#Preloader1").css("display","none")
      connection.release()
    })
  })
}

function LoadStats(){
  pool.getConnection(function(error,connection){
    connection.query("SELECT Count(*) as Conteggio,SUM(PrezzoComprato) as Acquisti,SUM(PrezzoVenduto) as Vendite FROM inventariobot WHERE IdUtente = ?",UserId,function(err,results,fields){
      $("#BotsPurchases").text(Valuta + " " + results[0].Acquisti)
      $("#BotsSold").text(Valuta + " " + results[0].Vendite)
      $("#NumberOfBots").text(results[0].Conteggio)
      $("#ProfitBots").text(Valuta + " " + (results[0].Vendite - results[0].Acquisti))
      connection.release()
    })
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
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-success'>"+Valuta + " " + Prezzo +"</span></td>" +
        "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-info'>"+Valuta + " " + Vendita +"</span></td>" +
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
    $("#errorBotModal").text("The field 'Price sold' must be a number!")
    return 
  }
  pool.getConnection(function(error,connection){
    connection.query("INSERT INTO inventariobot (BrandBot,ImmagineBot,PrezzoComprato,PrezzoVenduto,Note,IdUtente) VALUES (?,?,?,?,?,?)",[Brand,Img,Purc,Sold,Notes,UserId],function(err,results,fields){
      if(err){
        console.log(err)
      }
      connection.release()
      location.reload()
    })
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
  pool.getConnection(function(error,connection){
    connection.query("UPDATE inventariobot SET PrezzoComprato = ?,PrezzoVenduto = ?,Note = ? WHERE IdBot = ?",[Purc,Sold,Notes,IdToModify],function(err,results,fields){
      if(err){
        console.log(err)
      }
      connection.release()
      location.reload()
    })
  })
}

function DeleteBot(IdBot){
  pool.getConnection(function(error,connection){
    connection.query("DELETE FROM inventariobot WHERE IdBot = ?",[IdBot],function(err,results,fields){
      if(err){
        console.log(err)
      }
      connection.release()
      location.reload()
    })
  })
}
