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



/*const mysql = require("mysql")
const moment = require("moment")
var config = {
    waitForConnections : false,
    connectionLimit: 50,
    host     : 'www.boringio.com',
    user     : 'desktopuser',
    password : 'anfi1812',
    database : 'gestionaleprodotti'
}

var UserId = 1086
var pool = mysql.createPool(config)
var Filtro = "Lifetime"

pool.getConnection(function(error,connection){
    connection.query("SELECT * FROM costi WHERE IdUtente = ?",[UserId],function(error,results,fields){
        for(var Exp of results){
            var DataInizio = moment(Exp.DataCosto).format("DD-MM-YYYY")
            var Res = ReturnPriceFilter(DataInizio,Filtro,Exp.Mese,Exp.PrezzoCosto)
            console.log(Res)
            console.log("-----------------")
        }
    })
})*/
var TotalBots = 0
var TotalCookGroups = 0
var TotalShip = 0
var TotalProxy = 0
var TotalCustom = 0

function IterateResults(Filtro,Array){
    var i = 0
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
            Total = 0
            var DataFine = CreateEndDateYear()
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
        case "Return":
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
    console.log("Calcolo parziale")
    console.log(Total)
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

function GetMonthsInside(StartDate,EndDate){
    console.log(EndDate.diff(StartDate,"months",true))
    return Math.ceil(EndDate.diff(StartDate,"months",true))
}

function ReturnsNumberOfTimes(StartDate,EndDate){
    var I = StartDate.split("-")
    var F = EndDate.split("-")
    var a = moment([I[2],I[1] - 1,I[0]])
    var b = moment([F[2],F[1] - 1,F[0]])
    console.log(a.toDate())
    console.log(b.toDate())
    if((a <= b)){
        return GetMonthsInside(a,b)
    }else{
        return null
    }
}

exports.IterateResults = IterateResults

/*function SetThisYearExpenses(ExpensesList){
    var TotalOthers = 0
    var TotalBots = 0
    var TotalCookGroups = 0 
    var TotalProxies = 0
    var TotalShips = 0
    for(var Expense of ExpensesList){
        //console.log(Expense)
        var Total = 0
        var ArrMonths = Expense.PagamentoMesi.split(" ")
        if(parseInt(GetYear(Expense.DataCosto)) == parseInt(GetTodaysYear())){
            if(MesiRicorrenza == 0 && GetDateFormat(Expense.DataCosto).split("-")[1] >= parseInt(GetTodaysMonth())){
                Total += PrezzoCosto
            }else{
                for(var i = parseInt(GetMonth(Expense.DataCosto)) - 1; i < 12; i++){
                    Total += parseInt(ArrMonths[i])
                }
            }      
        }else{
            var thisYear = parseInt(GetTodaysYear())
            var totMonth = (thisYear - parseInt(GetYear(Expense.DataCosto))) * 12
            for(var i = totMonth + parseInt(GetTodaysMonth()) - 1; i < totMonth + 12; i++){
                Total += parseInt(ArrMonths[i])
            }
        }
        switch(Expense.NomeSelezioneCosto){
            case "Bot":
                TotalBots += Total
            break;
            case "CookGroup":
                TotalCookGroups += Total
            break;
            case "Proxy":
                TotalProxies += Total
            break;
            case "Ship":
                TotalShips += Total
            break;
            default:
                TotalOthers += Total
            break;
        }
    }
    var Res = {
        TotalBots: TotalBots, 
        TotalCookGroups: TotalCookGroups,
        TotalShips: TotalShips,
        TotalProxies: TotalProxies,
        TotalOthers: TotalOthers
    }
    return Res
}*/

/*function SetThisMonthExpenses(ExpensesList,FilteredMonth){
    var TotalOthers = 0
    var TotalBots = 0
    var TotalCookGroups = 0 
    var TotalProxies = 0
    var TotalShips = 0
    for(var Expense of ExpensesList){
        var Total = 0
        var ArrMonths = Expense.PagamentoMesi.split(" ") 
        if(parseInt(GetYear(Expense.DataCosto)) == parseInt(GetTodaysYear())){
            if(Expense.MesiRicorrenza == 0){
                var Date1 = GetDateFormat2(Expense.DataCosto).split("-")
                var Date2 = GetTodaysYear() + "-" +  $("#FilterDate").val()
                if(Date1[0] + "-" + Date1[1] == Date2){
                    Total += parseInt(Expense.PrezzoCosto)
                }
            }else{
                Total += parseInt(ArrMonths[GetTodaysMonth() - 1])
            }
        }else{
            var StartMonth = parseInt(GetTodaysYear() - GetYear(Expense.DataCosto)) * 12
            Total += parseInt(ArrMonths[parseInt(StartMonth) + parseInt($("#FilterDate").val())] - 1)      
        }
        switch(Expense.NomeSelezioneCosto){
            case "Bot":
                TotalBots += Total
            break;
            case "CookGroup":
                TotalCookGroups += Total
            break;
            case "Proxy":
                TotalProxies += Total
            break;
            case "Ship":
                TotalShips += Total
            break;
            default:
                TotalOthers += Total
            break;
        }
    }
    var Res = {
        TotalBots: TotalBots,
        TotalCookGroups: TotalCookGroups,
        TotalShips: TotalShips,
        TotalProxies: TotalProxies,
        TotalOthers: TotalOthers
    }
    return Res
}*/


/*function SetLifetimeExpenses(ExpensesList){
    console.log("Lista spese")
    console.log(ExpensesList)
    for(var Exp of ExpensesList){
        var ArrMonths = Exp.PagamentoMesi.split(" ")
        switch(parseInt(getYear(Expense.DataCosto))){
            case 2020:
                break;
            case 2021:
                break;
            case 2022:
                break;
            case 2023: 
                break;
            case 2024:
                break; 
        }
    }
    /*switch(Year){
        case "2020":
            offsett = 0;
        break;
        case "2021":
            offsett = 12;
        break;
        case "2022":
            offsett = 24;
        break;
        case "2023":
            offsett = 36;
        break;
        case "2024":
            offsett = 48;
        break;
    }
    return 
}*/

/*function SetNumberOfItemsPerType(ExpensesList){
    var NrCookGroups = 0
    var NrBots = 0
    var NrShips = 0
    var NrProxies = 0
    var NrCustoms = 0

    for(var Expenses of ExpensesList){
        switch(Expenses.NomeSelezioneCosto){
            case "Bot":
                NrBots+=1
            break;
            case "CookGroup":
                NrCookGroups+=1
            break;
            case "Proxy":
                NrProxies+=1
            break;
            case "Ship":
                NrShips+=1
            break;
            default:
                NrCustoms+=1
            break;
        }
    }
}

function ReturnedIndexMonthYear(DateStart){
    var a = moment(GetDateFormat(DateStart),'D-M-YYYY');
    var b = moment(GetDateFormat(new Date()),'D-M-YYYY');
    var diffMonths = b.diff(a, 'months');
    return diffMonths
}

function ReturnedIndexMonthYearForYear(DateStart){
    var a = moment(GetDateFormat(DateStart),'D-M-YYYY');
    var b = moment(GetDateFormat(new Date()),'D-M-YYYY');
    var diffMonths = b.diff(a, 'months');
    //console.log("Diff di mesi" + diffMonths);
    return diffMonths
}

function ReturnedIndexMonthYearForLifetime(DateStart){
    var a = moment(GetDateFormat(DateStart),'D-M-YYYY');
    var b = moment(GetDateFormat(new Date()),'D-M-YYYY');
    var diffMonths = b.diff(a, 'months');
    //console.log("Diff di mesi" + diffMonths);
    return diffMonths
}

exports.LifetimeExpenses = SetLifetimeExpenses
exports.MonthExpenses = SetThisMonthExpenses
exports.YearExpenses = SetThisYearExpenses
exports.SetTypes = SetNumberOfItemsPerType*/
