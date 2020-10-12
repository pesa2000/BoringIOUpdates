const connection = require("electron").remote.getGlobal("conn");
const path = require("path")
const Util = require(path.join(__dirname,"/utilityScripts/query_graphs_expenses.js"))
const moment = require("moment")

var CostsBotList = []
var CostsCookGroupList = []
var CostsProxiesList = []
var CostsShipsList = []
var CostsOthersList = []

var Select = document.getElementById("FilterDate")
var Filter = parseInt(GetNewDateMonth())

$(document).ready(Request(Filter))

Select.addEventListener("change", () => {
    Filter = $("#FilterDate").val() 
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
    /*console.log("New request from cake graph")*/
   /* console.log(FilterDate)*/
    ipc.send("getUserId")
    ipc.on("ReturnedId",async (event,arg) => {
        UserId = arg
        connection.query("SELECT * FROM costi WHERE IdUtente = ? AND YEAR(DataCosto) <= ?",[UserId,GetNewDateYear()],  function (error, results, fields) {
            if(error) console.log(error)
            SplitArrays(results)
            Util.SetTypes(results)
            var Res = ""
            if(Filter == "Year"){
                Res = Util.YearExpenses(results)
            }else{
                Res = Util.MonthExpenses(results,FilterDate)
            }
            CreateGraph(Res)
        })
    })
}

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
    var Tot = Res.TotalBots + Res.TotalCookGroups + Res.TotalShips + Res.TotalProxies + Res.TotalOthers

    var p1 = parseInt((Res.TotalBots/Tot) * 100) 
    var p2 = parseInt((Res.TotalCookGroups/Tot) * 100) 
    var p3 = parseInt((Res.TotalShips/Tot) * 100) 
    var p4 = parseInt((Res.TotalProxies/Tot) * 100) 
    var p5 = parseInt((Res.TotalOthers/Tot) * 100)  

    var chart1 = c3.generate({
        bindto: '#campaign-v2',
        data: {
            columns: [
                ['CookGroups', p1],
                ['Bots', p2],
                ['Proxies', p3],
                ['Ships', p4],
                ['Others',p5]
            ],

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
            pattern: [
                '#61C822',
                '#5f76e8',
                '#ff4f70',
                '#01caf1',
                '#e6b975'
            ]
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