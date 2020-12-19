const { totalmem } = require("os")
const { parse } = require("path")
const moment = require("moment")
const { Console } = require("console")

var Offsett = 0

function GetDateFormat(DateChosen){
    var DateChanged = moment(DateChosen).format('DD[-]MM[-]YYYY')
    return DateChanged
}

function GetDateFormat2(DateChosen){
    var DateChanged = moment(DateChosen).format('YYYY[-]MM[-]DD')
    return DateChanged
}

function GetMonth(DateChosen){
    var DateChanged = moment(DateChosen).format('YYYY[-]MM[-]DD')
    var app = DateChanged.split("-")
    return app[1]
}

function GetYear(DateChosen){
    var DateChanged = moment(DateChosen).format('YYYY[-]MM[-]DD')
    var app = DateChanged.split("-")
    return app[0]
}

function GetTodaysMonth() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    return mm;
  }
  
function GetTodaysYear() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    return yyyy;
}

function GetTodaysDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var tot = yyyy + "-"+ mm + "-" +dd
    return tot;
}

var TotalBots = 0
var TotalCookGroups = 0
var TotalShip = 0
var TotalProxy = 0
var TotalCustom = 0

function IterateResults(Filtro,Array){
    var i = 0
    TotalBots = 0
    TotalCookGroups = 0
    TotalShip = 0
    TotalProxy = 0
    TotalCustom = 0
    for(var Exp of Array){
        var DataInizio = moment(Exp.DataCosto).format("DD-MM-YYYY")
        var Res = ReturnPriceFilter(DataInizio,Filtro,Exp.MesiRicorrenza,Exp.PrezzoCosto)
        switch(Exp.NomeSelezioneCosto){
            case "CookGroup":
                TotalCookGroups += parseInt(Res)
            break; 
            case "Ship":
                TotalShip += parseInt(Res)
            break; 
            case "Proxy":
                TotalProxy += parseInt(Res)
            break; 
            case "Bot":
                TotalBots += parseInt(Res)
            break; 
            default:
                TotalCustom += parseInt(Res)
            break; 
        }
    }
    return Obj = {
        Cook: TotalCookGroups,
        Ship: TotalShip,
        Proxy: TotalProxy,
        Bot:TotalBots,
        Custom: TotalCustom
    }
}

function ReturnPriceFilter(DataInizio,Filtro,Mese,Costo){
    var DataFine
    var app = DataInizio.split("-")
    var StartingDate = moment([app[2],app[1]-1,app[0]])
    var Total = 0
    switch(Filtro){
        case "Lifetime":
            Total = 0
            var DataFine = CreateEndDateLifetime()
            if(Mese != 0){
                do{
                    Total += parseInt(Costo)
                    StartingDate.add(Mese,"months")
                }while(StartingDate < DataFine)   
            }else{
                if(StartingDate < DataFine){
                    Total += parseInt(Costo)
                }
            }
            break;
        case "Year":
            var StartingPartialDate = moment([GetYear(),0,1])
            Total = 0
            var DataFine = CreateEndDateYear()
            if(Mese != 0){
                do{
                    Total += parseInt(Costo)
                    StartingDate.add(Mese,"months")
                }while(StartingDate < DataFine)   
            }else{
                console.log("STARTING YEAR DATE")
                console.log(StartingPartialDate.toString())
                if(StartingDate <= DataFine && StartingDate >= StartingPartialDate){
                    Total += parseInt(Costo)
                }
            }
            break;
        default :
            Total = 0
            var DataFine = CreateEndDateMonth(Filtro)
            if(Mese != 0){
                do{
                    if(DataFine.isSame(StartingDate,"month") == true){
                        Total += parseInt(Costo)
                    }
                    StartingDate.add(Mese,"months")

                }while(StartingDate < DataFine)   
            }else{
                console.log(DataFine.toString())
                console.log(StartingDate.toString())
                if(DataFine.isSame(StartingDate,"month")){
                    console.log("Le date coincidono")
                    Total += parseInt(Costo)
                }
            }
        break;
    }
   /* console.log("Calcolo parziale")
    console.log(Total)*/
    return Total
}

function CreateEndDateLifetime(){
    var end = new Date();
    var dd = String(end.getDate()).padStart(2, '0');
    var mm = String(end.getMonth() + 1).padStart(2, '0');
    var yyyy = end.getFullYear();

    end = moment([yyyy,mm-1,dd]);
    return end
}

function CreateEndDateMonth(filter){
    var dd = new Date().getDate()
    var end = new Date()
    var yyyy = end.getFullYear();
    end = moment([yyyy,filter-1,dd]);
    return end
}

function CreateEndDateYear(){
    var end = new Date();
    var yyyy = end.getFullYear();
    end = moment([yyyy,11,1]);
    return end
}

function GetYear(){
    var end = new Date();
    var yyyy = end.getFullYear();
    return yyyy
}

exports.IterateResults = IterateResults
