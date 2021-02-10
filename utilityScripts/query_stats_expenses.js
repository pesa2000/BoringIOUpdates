var Offsett = 0

var UserId = require('electron').remote.getGlobal('UserId')
var Valuta = require('electron').remote.getGlobal('Valuta')

function GetDateFormat(DateChosen){
    var DateChanged = moment(DateChosen).format('DD[-]MM[-]YYYY')
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

function SetThisYearExpenses(ExpensesList){
    var Total = 0
    for(var Expense of ExpensesList){
        var parTot = 0
        var ArrMonths = Expense.PagamentoMesi.split(" ")
        var LastIndex = parseInt(ReturnedIndexMonthYearForYear(Expense.DataCosto)) + parseInt(GetMonth(Expense.DataCosto))
        var i = 0
        var init = LastIndex//parseInt(GetMonth(Expense.DataCosto))
        //console.log("Init: " + init)
        var fin = LastIndex + 12
        //console.log("Final: " + fin)
        var pass = parseInt(Expense.MesiRicorrenza)
        /*console.log("Index calcolato " + LastIndex)
        console.log("Mese Iniziale " + parseInt(GetMonth(Expense.DataCosto)) + LastIndex)
        var c = parseInt(LastIndex) + 12 - 1
        console.log("Mese Finale " + parseInt(GetMonth(Expense.DataCosto)) + c)*/
        if(parseInt(Expense.MesiRicorrenza) > 0){
            for(i = init - 1; i < fin - 1; i++){
                console.log("Price cycle")
                console.log(ArrMonths[i])
                parTot += parseInt(ArrMonths[i])
            }   
        }else{
            if(GetYear(Expense.DataCosto) == GetYear(new Date())){
                parTot += parseInt(Expense.PrezzoCosto)
            }
        }
        Total += parTot
    }
    //console.log("Total year costs" + Total)
    document.getElementById("TotalYear").innerHTML = Valuta + "" +Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
}

function SetThisMonthExpenses(ExpensesList){
    var Total = 0
    for(var Expense of ExpensesList){
        var ArrMonths = Expense.PagamentoMesi.split(" ")
        //console.log("Lenght Arr" + ArrMonths.length)
        var LastIndex = ReturnedIndexMonthYear(Expense.DataCosto)
        Total += parseInt(ArrMonths[LastIndex + parseInt(GetMonth(Expense.DataCosto)) - 1])
    }
    //console.log("Total month costs" + Total)
    document.getElementById("TotalMonth").innerHTML = Valuta + "" +Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
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
    document.getElementById("NrBots").innerHTML = NrBots
    document.getElementById("NrCookGroups").innerHTML = NrCookGroups
    document.getElementById("NrProxies").innerHTML = NrProxies
    document.getElementById("NrShips").innerHTML = NrShips
    document.getElementById("NrCustoms").innerHTML = NrCustoms
}

function ReturnedIndexMonthYear(DateStart){
    var a = moment(GetDateFormat(DateStart),'D-M-YYYY');
    var b = moment(GetDateFormat(new Date()),'D-M-YYYY');
    var diffMonths = b.diff(a, 'months');
    //console.log("Diff di mesi"diffMonths);
    return diffMonths
}

function ReturnedIndexMonthYearForYear(DateStart){
    /*var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month, day);*/

    var a = moment(GetDateFormat(DateStart),'D-M-YYYY');
    var b = moment(GetDateFormat(new Date()),'D-M-YYYY');
    var diffMonths = b.diff(a, 'months');
    //console.log("Diff di mesi" + diffMonths);
    return diffMonths
}

exports.MonthExpenses = SetThisMonthExpenses
exports.YearExpenses = SetThisYearExpenses
exports.SetTypes = SetNumberOfItemsPerType

// 18-11-2000
// 20-10-2022
// 20-10-2023