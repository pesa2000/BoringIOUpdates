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

function IterateResults(Filtro1,Filtro2,Array){
    var i = 0
    TotalBots = 0
    TotalCookGroups = 0
    TotalShip = 0
    TotalProxy = 0
    TotalCustom = 0
    for(var Exp of Array){
        var DataInizio = moment(Exp.DataCosto).format("DD-MM-YYYY")
        var Res = ReturnPriceFilter(DataInizio,Filtro1,Filtro2,Exp.MesiRicorrenza,Exp.PrezzoCosto)
        console.log("------------------------------------")
        console.log("------------------------------------")
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

function ReturnPriceFilter(DataInizio,FiltroYear,FiltroMonth,Mese,Costo){
    var DataFine
    var app = DataInizio.split("-")
    var StartingDate = moment([app[2],app[1]-1,app[0]])
    console.log("Data Inizio")
    console.log(StartingDate.toString())
    var Total = 0
    switch(true){
        case FiltroYear == "Lifetime":
            Total = 0
            var DataFine = CreateEndDateLifetime()
            if(Mese != 0){
                do{
                    Total += parseInt(Costo)
                    StartingDate.add(Mese,"months")
                }while(StartingDate <= DataFine)
            }else{
                if(StartingDate <= DataFine){
                    Total += parseInt(Costo)
                }
            }
            break;
        case FiltroYear != "Lifetime" && FiltroMonth == "All":
            console.log("Filtro per Year")
            var StartingPartialDate = moment([FiltroYear,0,1])
            Total = 0
            var DataFine = CreateEndDateYear(FiltroYear)
            console.log(DataFine.toString())
            if(Mese != 0){
                do{
                  if(StartingDate <= DataFine && StartingDate >= StartingPartialDate){
                    Total += parseInt(Costo)
                    console.log("Entra")
                  }else{
                    console.log("Non entra")
                  }
                  StartingDate.add(Mese,"months")
                }while(StartingDate <= DataFine)
            }else{
                if(StartingDate <= DataFine && StartingDate >= StartingPartialDate){
                    Total += parseInt(Costo)
                }
            }
            break;
        default :
        console.log("CASO MENSILE")
            var MonthToday = parseInt(GetTodaysMonth())
            var MonthFilter = parseInt(FiltroMonth)
            var YearToday = parseInt(GetTodaysYear())    
            var YearFilter = parseInt(FiltroYear)
            console.log("Mese oggi: " + MonthToday)
            console.log("Mese filtrato: " + FiltroMonth)
            console.log("Anno oggi: " + YearToday)
            console.log("Anno filtrato: " + FiltroYear)
            var DataFine
            Total = 0
            if((YearFilter == YearToday && MonthFilter < MonthToday) || (YearFilter < YearToday)){
              DataFine = CreateEndDateMonth(FiltroYear,FiltroMonth)
              console.log("Data Fine mensile minore")
              console.log(DataFine.toString())
              if(Mese != 0){
                do{
                  if(StartingDate.isSame(DataFine,"month") && DataFine >= StartingDate){
                    Total += parseInt(Costo)
                  }
                  StartingDate.add(Mese,"months")
                }while(StartingDate <= DataFine)
              }else{
                if(DataFine.isSame(StartingDate,"month") && DataFine >= StartingDate){
                    console.log("Le date coincidono")
                    Total += parseInt(Costo)
                }
              }
            }else if(MonthToday == MonthFilter && YearFilter == YearToday){
              DataFine = GetTodaysDate()
              console.log("Data Fine mensile uguale")
              console.log(DataFine.toString())
              if(Mese != 0){
                do{
                  if(StartingDate.isSame(DataFine,"month") && DataFine >= StartingDate){
                    Total += parseInt(Costo)
                  }
                  StartingDate.add(Mese,"months")
                }while(StartingDate <= DataFine)
              }else{
                if(DataFine.isSame(StartingDate,"month") && DataFine >= StartingDate){
                    Total += parseInt(Costo)
                }
              }
            }else{
                console.log("Vado qui")
                Total += 0
            }
        break;
    }
    return Total
}

function GetTodaysMonth(){
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    return mm
  }
  
  function CreateEndDateLifetime(){
      var end = new Date();
      var dd = String(end.getDate()).padStart(2, '0');
      var mm = String(end.getMonth() + 1).padStart(2, '0');
      var yyyy = end.getFullYear();
  
      end = moment([yyyy,mm-1,dd]);
      return end
  }
  
  function CreateEndDateMonth(YearFiltered,MonthFiltered){
    var start = new Date();
    var yyyy = start.getFullYear();
    var StartDate = moment([YearFiltered,MonthFiltered-1])
    var EndDate = moment(StartDate).endOf('month')
    return EndDate
  }
  
  
  function CreateEndDateYear(YearFiltered){
      var end = new Date();
      var yyyy = end.getFullYear();
      var dd = String(end.getDate()).padStart(2, '0');
      var mm = String(end.getMonth() + 1).padStart(2, '0');
      end = moment([YearFiltered,11,31]); //Cambiare in yyyy/mm - 1/dd - 1
      return end
  }
  
  function GetYear(){
      var end = new Date();
      var yyyy = end.getFullYear();
      return yyyy
  }
  
  function GetTodaysDate(){
    var today = new Date();
    var yyyy = today.getFullYear();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    today = moment([yyyy,parseInt(mm) - 1,dd]); //Cambiare in yyyy/mm - 1/dd - 1
    return today
  }
  

exports.IterateResults = IterateResults
