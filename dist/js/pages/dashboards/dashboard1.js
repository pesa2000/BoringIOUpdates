const pool = require("electron").remote.getGlobal("pool");
const path = require("path")
const Util = require(path.join(__dirname,"/utilityScripts/query_graphs_expenses.js"))
const moment = require("moment")
var UserId = require('electron').remote.getGlobal('UserId')

/*GetValutaAsUtf8(UserId)
function GetValutaAsUtf8(Id){
    connection.query("SELECT CONVERT(Valuta USING utf8) as Valuta1 FROM utenti WHERE UserId = ?",Id,function(error,results,fileds){
        if(error)console.log(error)
        console.log(results[0].Valuta1)
        Valuta = Util.GetCurrencyFromUTF8(results[0].Valuta1)
        console.log(Valuta)
    })
}*/

var CostsBotList = []
var CostsCookGroupList = []
var CostsProxiesList = []
var CostsShipsList = []
var CostsOthersList = []

var Select = document.getElementById("FilterDate")
var Filter1 = parseInt(GetNewDateMonth())

$(document).ready(() => {
    console.log("Filtro scelto onload")
    console.log(Filter1)
    Request()
})

Select.addEventListener("change", () => {
    Filter = $("#FilterDate").val() 
    console.log("Filtro dashboard1")
    console.log(Filter)
    Request(Filter)
})

function GetNewDateMonth(){
    var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    //console.log(d[2])
    return d[1]
}

function GetNewDateYear(){
    var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    //console.log(d[2])
    return d[2]
}

function Request(FilterDate){
    ipc.send("getUserId")
}

ipc.on("ReturnedId",async (event,arg) => {
    UserId = arg
    pool.getConnection(function(err,connection){
        connection.query("SELECT * FROM costi WHERE IdUtente = ? AND YEAR(DataCosto) <= ?",[UserId,GetNewDateYear()],  function (error, results, fields) {
            if(error) console.log(error)
            SplitArrays(results)
            //Util.SetTypes(results)
            var Res = ""
            Res = Util.IterateResults(Filter1,results)
            console.log(Res)
            connection.release()
            CreateGraph(Res)
        })
    })
})

function SplitArrays(CostsList){
    var length1 = 0
    var length2 = 0
    var length3 = 0
    var length4 = 0
    var length5 = 0
    for(var Cost of CostsList){
      //console.log(Cost)
      switch(Cost.NomeSelezioneCosto){
        case "Bot":
          CostsBotList.push(Cost)
          length3 += 1
          break;
        case "CookGroup":
          CostsCookGroupList.push(Cost)
          length1 += 1
          break;
        case "Proxy":
          CostsProxiesList.push(Cost)
          length2 += 1
          break;
        case "Ship":
          CostsShipsList.push(Cost)
          length4 += 1
          break;
        default:
          CostsOthersList.push(Cost)
          length5 += 1
          break;
      }
    }
}

function CreateGraph(Res){
    console.log(Res)
    var Tot = Res.Bot + Res.Cook + Res.Ship + Res.Proxy + Res.Custom

    console.log(Tot)

    var p1 = parseInt((Res.Bot/Tot) * 100) 
    var p2 = parseInt((Res.Cook/Tot) * 100) 
    var p3 = parseInt((Res.Ship/Tot) * 100)
    var p4 = parseInt((Res.Proxy/Tot) * 100) 
    var p5 = parseInt((Res.Custom/Tot) * 100)  

    console.log(p1)
    console.log(p2)
    console.log(p3)
    console.log(p4)
    console.log(p5)

    var Color = []
    var Values = []

    if(p1 != 0){Color.push("#61C822"); Values.push(['CookGroups', p2])}
    if(p2 != 0){Color.push("#5f76e8"); Values.push(['Bots', p1])}
    if(p3 != 0){Color.push("#ff4f70"); Values.push(['Proxies', p4])}
    if(p4 != 0){Color.push("#01caf1"); Values.push(['Ships', p3])}
    if(p5 != 0){Color.push("#e6b975"); Values.push(['Others', p5])}

    $("#BotsCosts").text(Valuta + " " +Res.TotalBots)
    $("#CookGroupsCosts").text(Valuta + " " +Res.TotalCookGroups)
    $("#ShipsCosts").text(Valuta + " " +Res.TotalShips)
    $("#ProxiesCosts").text(Valuta + " " +Res.TotalProxies)
    $("#OthersCosts").text(Valuta + " " +Res.TotalOthers)

    var chart1 = c3.generate({
        bindto: '#campaign-v2',
        data: {
            columns: Values,

            type: 'donut',
            tooltip: {
                show: true
            }
        },
        donut: {
            label: {
                show: false
            },
            fontColor: '#FFFFFF',
            width: 18
        },

        legend: {
            hide: true
        },
        color: {
            pattern: Color
        }
    });

    d3.select('#campaign-v2 .c3-chart-arcs-title').style('font-family', 'Rubik');

    // ============================================================== 
    // income
    // ============================================================== 
    var data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
            [5, 4, 3, 7, 5, 10]
        ]
    };

    var options = {
        axisX: {
            showGrid: false
        },
        seriesBarDistance: 1,
        chartPadding: {
            top: 15,
            right: 15,
            bottom: 5,
            left: 0
        },
        plugins: [
            Chartist.plugins.tooltip()
        ],
        width: '100%'
    };

    var responsiveOptions = [
        ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
                labelInterpolationFnc: function (value) {
                    return value[0];
                }
            }
        }]
    ];
    new Chartist.Bar('.net-income', data, options, responsiveOptions);

    // ============================================================== 
    // Visit By Location
    // ==============================================================
    jQuery('#visitbylocate').vectorMap({
        map: 'world_mill_en',
        backgroundColor: 'transparent',
        borderColor: '#000',
        borderOpacity: 0,
        borderWidth: 0,
        zoomOnScroll: false,
        color: '#d5dce5',
        regionStyle: {
            initial: {
                fill: '#d5dce5',
                'stroke-width': 1,
                'stroke': 'rgba(255, 255, 255, 0.5)'
            }
        },
        enableZoom: true,
        hoverColor: '#bdc9d7',
        hoverOpacity: null,
        normalizeFunction: 'linear',
        scaleColors: ['#d5dce5', '#d5dce5'],
        selectedColor: '#bdc9d7',
        selectedRegions: [],
        showTooltip: true,
        onRegionClick: function (element, code, region) {
            var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
            alert(message);
        }
    });

    // ==============================================================
    // Earning Stastics Chart
    // ==============================================================
    var chart = new Chartist.Line('.stats', {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [
            [11, 10, 15, 21, 14, 23, 12]
        ]
    }, {
        low: 0,
        high: 28,
        showArea: true,
        fullWidth: true,
        plugins: [
            Chartist.plugins.tooltip()
        ],
        axisY: {
            onlyInteger: true,
            scaleMinSpace: 40,
            offset: 20,
            labelInterpolationFnc: function (value) {
                return (value / 1) + 'k';
            }
        },
    });

    // Offset x1 a tiny amount so that the straight stroke gets a bounding box
    chart.on('draw', function (ctx) {
        if (ctx.type === 'area') {
            ctx.element.attr({
                x1: ctx.x1 + 0.001
            });
        }
    });

    // Create the gradient definition on created event (always after chart re-render)
    chart.on('created', function (ctx) {
        var defs = ctx.svg.elem('defs');
        defs.elem('linearGradient', {
            id: 'gradient',
            x1: 0,
            y1: 1,
            x2: 0,
            y2: 0
        }).elem('stop', {
            offset: 0,
            'stop-color': 'rgba(255, 255, 255, 1)'
        }).parent().elem('stop', {
            offset: 1,
            'stop-color': 'rgba(80, 153, 255, 1)'
        });
    });

    $(window).on('resize', function () {
        chart.update();
    });
}