const { totalmem } = require("os")
const { parse } = require("path")

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

function SetThisYearExpenses(ExpensesList){
    var TotalOthers = 0
    var TotalBots = 0
    var TotalCookGroups = 0 
    var TotalProxies = 0
    var TotalShips = 0
    for(var Expense of ExpensesList){
        console.log(Expense)
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
    console.log(TotalBots)
    console.log(TotalCookGroups)
    console.log(TotalShips)
    console.log(TotalProxies)
    console.log(TotalOthers)
    var Res = {
        TotalBots: TotalBots,
        TotalCookGroups: TotalCookGroups,
        TotalShips: TotalShips,
        TotalProxies: TotalProxies,
        TotalOthers: TotalOthers
    }
    return Res
}

function SetThisMonthExpenses(ExpensesList,FilteredMonth){
    var TotalOthers = 0
    var TotalBots = 0
    var TotalCookGroups = 0 
    var TotalProxies = 0
    var TotalShips = 0
    for(var Expense of ExpensesList){
        console.log(Expense)
        var Total = 0
        var ArrMonths = Expense.PagamentoMesi.split(" ") 
        //console.log(ArrMonths)
        if(parseInt(GetYear(Expense.DataCosto)) == parseInt(GetTodaysYear())){
            if(Expense.MesiRicorrenza == 0){
                var Date1 = GetDateFormat2(Expense.DataCosto).split("-")
                var Date2 = GetTodaysYear() + "-" +  $("#FilterDate").val()
                console.log("Data costo")
                console.log(Date1[0] + "-" + Date1[1])
                console.log("Data filtrata")
                console.log(Date2)
                if(Date1[0] + "-" + Date1[1] == Date2){
                    console.log("Il mese e l'anno coincidono")
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
}

function SetNumberOfItemsPerType(ExpensesList){
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

exports.MonthExpenses = SetThisMonthExpenses
exports.YearExpenses = SetThisYearExpenses
exports.SetTypes = SetNumberOfItemsPerType
