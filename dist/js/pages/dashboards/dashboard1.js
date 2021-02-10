const pool = require("electron").remote.getGlobal("pool");
const path = require("path")
const moment = require("moment")

var Select = document.getElementById("FilterDate")
var Filter1 = parseInt(GetNewDateMonth())
var Filter2 = parseInt(GetNewDateYear())

var FilterMonth = ""
var FilterYear = ""

$(document).ready(() => {
    Request()
})

Select.addEventListener("change", () => {
    Filter1 = $("#FilterDateMonths").val() 
    Filter2 = $("#FilterDateYears").val() 
    Request()
})

function GetNewDateMonth(){
    var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    return d[1]
}

function GetNewDateYear(){
    var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
    return d[2]
}

function Request(){
    ipc.send("RequestedExpensesFetched",{Filter:Filter1,Filter2: Filter2})
}

ipc.on("ReturnedExpensesFetched",(event,arg) => {
    CreateGraph(arg.Res)
})

function CreateGraph(Res){
    console.log("Creato il grafico spero")
    var Tot = Res.Bot + Res.Cook + Res.Ship + Res.Proxy + Res.Custom
    var p1 = parseInt((Res.Bot/Tot) * 100) 
    var p2 = parseInt((Res.Cook/Tot) * 100) 
    var p3 = parseInt((Res.Ship/Tot) * 100)
    var p4 = parseInt((Res.Proxy/Tot) * 100) 
    var p5 = parseInt((Res.Custom/Tot) * 100)  
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