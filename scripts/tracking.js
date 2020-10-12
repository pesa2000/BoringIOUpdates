var mysql = require('mysql')
var moment = require('moment')
var config = require('electron').remote.getGlobal('configuration')
var connection = require('electron').remote.getGlobal('conn')
var UserId = require('electron').remote.getGlobal('UserId')

window.setInterval(CheckConnection,5000)

function minimize(){
    ipc.send("Minimize")
}
function maximize(){
    ipc.send("Maximize")
}
function quit(){
    ipc.send("AppQuit")
}

var TrackingList = [] 
var ShoesList = []

var DHL = "https://www.dhl.com/it-it/home/tracking/tracking-express.html?submit=1&tracking-id=";
var TNT1 = "https://www.tnt.it/tracking/getTrack?WT=1&ldv=";
var UPS1 = "https://www.ups.com/track?loc=en_it&tracknum=";
var UPS2 = "&Requester=NS/trackdetails";
var Fedex1 = "https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=";
var Fedex2 = "&clienttype=ivshpalrt";
var Bartolini = "https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspediz=";
var GLS1 = "https://www.gls-italy.com/?option=com_gls&view=track_e_trace&mode=search&numero_spedizione=";
var GLS2 = "&tipo_codice=nazionale";
var SDA = "https://www.sda.it/wps/portal/Servizi_online/ricerca_spedizioni?locale=it&tracing.letteraVettura=";
var DPD = "https://www.dpd.co.uk/tracking/quicktrack.do?search.parcelNumber=";
var POSTAT = "https://www.post.at/sv/sendungsdetails?snr=";


function TemplateTracking(Id,Photo,UrlKey,Name,Code,Date,Courier,Size){
    var SingleTracking = "<tr>" + 
    " <td>" +
        "<div class='media align-items-center position-relative'><img class='rounded border border-200' src='"+Photo+"' width='60' alt='' />" +
         "<div class='media-body ml-3'>" +
           "<h6 class='mb-1 font-weight-bold text-700' style='color:#fff !important;'>"+Name+"</h6>" +
           "<span class='badge badge rounded-capsule badge-soft-info' style=cursor:pointer>" +
              Code +
          "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +                
    "<td class='align-middle'>" + Date + "</td>" +
    "<td class='align-middle'>" + Courier + "</td>" +
    "<td class='align-middle'><span class='badge badge rounded-capsule badge-soft-warning'>" + Size+ "<span  data-fa-transform='shrink-2'></span></span></td>" +
    "<td></td>" +
    "<td class='align-middle'>" +
        "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'CheckStatus("+Id+")'>" +
            "<span class='fas fa-truck' data-fa-transform='shrink-3 down-2'></span>" +
        "</button>" +
        "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Delete("+Id+")' >" +
            "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
        "</button>" +
      "</td>" +
  "</tr>";
    return SingleTracking
}

function FlipDateAndChange(DateToChange){
    return moment(DateToChange).format('DD[/]MM[/]YYYY')
}

function ChangeDate(DateToChange){
    return moment(DateToChange).format('YYYY[-]MM[-]DD')
}

function LoadTrackings(){
    document.getElementById("ShoesListModal").innerHTML = ""
    document.getElementById("TrackingTable").innerHTML = ""
    connection.query("SELECT * FROM spedizioni INNER JOIN inventario on inventario.IdProdotto = spedizioni.IdProdotto WHERE spedizioni.IdUtente = ?",UserId,  function (error, results, fields) {
        if(error) console.log(error)
        TrackingList = results
        console.log(TrackingList)
        for(var Track of TrackingList){
            document.getElementById("TrackingTable").innerHTML += TemplateTracking(Track.IdSpedizione,Track.ImmagineProdotto,Track.UrlKey,Track.NomeProdotto,Track.TrackingCode,FlipDateAndChange(Track.DataAggiunta),Track.Corriere,Track.Taglia)
        }
        $("#Preloader1").css("display","none")
    })
    connection.query("SELECT * FROM inventario WHERE IdUtente = ?",UserId,function(error,results,fields){
        if(error) console.log(error)
        ShoesList = results
        for(var Shoe of ShoesList){
            console.log(Shoe)
            document.getElementById("ShoesListModal").innerHTML += "<option value = '" + Shoe.IdProdotto + "'>"+Shoe.NomeProdotto+" " + Shoe.Taglia + "</option>"
        }
    })
    //ipc.send("getUserId")
}
/*ipc.on("ReturnedId",(event,arg) => {
    console.log("Ciao")
    console.log(arg)
    UserId = arg
        /* INNER JOIN 
})*/

function Add(){
    var ItemIdChosen = $("#ShoesListModal").val()
    var TrackingCodeChosen = $("#TrackingCode").val()
    var DateSplitted = $("#wizard-datepicker").val().split('/')
    var RegularDate = DateSplitted[2] + "-" + DateSplitted[1] + "-" + DateSplitted[0]
    var Corriere = $("#Corriere option:selected").val()

    if(ItemIdChosen && TrackingCodeChosen && DateSplitted){

        var ShoeName = ""
        for(var Shoe of ShoesList){
            if(Shoe.IdProdotto == ItemIdChosen){
                ShoeName = Shoe.NomeProdotto
            }
        }

        $("#newTracking").modal('toggle')
        var Obj = CompleteUrlByCourier(TrackingCodeChosen,Corriere)
        console.log(Obj)
        var Query = "INSERT INTO spedizioni (UrlFotoCorriere,TrackingCode,Corriere,Note,UrlSpedizione,DataAggiunta,IdProdotto,IdUtente) values (?)"
        var Values = [
            [Obj.UrlPhoto,TrackingCodeChosen,Obj.NameCourier,"CreatedWithDesktopApp",Obj.Url,RegularDate,ItemIdChosen,UserId]
        ]
        connection.query(Query,Values,function(error,results,fields){
            if(error) console.log(error)
            CreateLog(`Added a tracking to ${ShoeName}`,"Track","Add",moment().format('MMMM Do YYYY, h:mm:ss a'))
            location.reload()
        })
    }else{
        $("#errorLabel").text("You need to add every field before continuing")
    }
}

function Delete(Id){
    var ShoeName = ""
    for(var Shoe of ShoesList){
        if(Shoe.IdProdotto == Id){
            ShoeName = Shoe.NomeProdotto
        }
    }
    connection.query("DELETE FROM spedizioni WHERE IdSpedizione = ?",Id,function(error,results,fields){
        if(error) console.log(error)
        CreateLog(`Deleted a tracking of ${ShoeName}`,"Track","Delete",moment().format('MMMM Do YYYY, h:mm:ss a'))
        location.reload()
    })
}

function CheckStatus(Id){
    for(var Track of TrackingList){
        console.log(Track.IdSpedizione)
        console.log(Id)
        if(Track.IdSpedizione == Id) {
            ipc.send("WindowTracking",Track.UrlSpedizione)
        } 
    }
}

function CompleteUrlByCourier(Code,Type){
    var Url = ""
    var NameCourier = Type
    var UrlPhoto = ""
    switch(Type){
        case "UPS":
            Url = UPS1 + Code + UPS2 
            UrlPhoto = '../assets/images/ups.png'
        break; 
        case "GLS":
            Url = GLS1 + Code + GLS2 
            UrlPhoto = "../assets/images/gls.png"
        break;
        case "DHL":
            Url = DHL + Code 
            UrlPhoto = '../assets/images/dhl.png'
        break;
        case "TNT":
            Url = TNT1 + Code 
            UrlPhoto = '../assets/images/tnt.png'
        break;      
        case "BRT":
            Url = Bartolini + Code
            UrlPhoto = '../assets/images/brt.png'
        break;
        case "SDA":
            Url = SDA + Code
            UrlPhoto = '../assets/images/sda.png'
        break;
        case "DPD":
            Url = DPD + Code
            UrlPhoto = '../assets/images/dpd.png'
        break;
        case "POSTAT":
            Url = POSTAT + Code
            UrlPhoto = '../assets/images/postat.png'
        break;
        case "FEDEX":
            Url = Fedex1 + Code + Fedex2
            UrlPhoto = '../assets/images/fedex.png'
        break;
    }
    return {Url,UrlPhoto,NameCourier}
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
    //console.log("Checking Connection")
}

ipc.on("CheckedConnection", (event,arg) =>{
    console.log(arg)
})