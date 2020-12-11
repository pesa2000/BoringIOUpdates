const { ipcMain } = require("electron")

function GetNewDateYear(){
  var d = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
  //console.log(d[2])
  return d[2]
}

function GetNewDateMonth(){
  var m = moment(new Date()).format("DD[/]MM[/]YYYY").split("/")
  //console.log(m[1])
  return m[1]
}

$(async function() {
  ipc.send("RequestedDataGraphs")
  ipc.on("ReturnedDataGraphsMorris",(event,arg)=>{
    console.log("Morris Chart Data")
    console.log(arg)
    var Data = arg.DATAGRAPHS
    "use strict";

    if(arg.FilterMonth == "Return"){
      var line = new Morris.Line({
        element: 'morris-line-chart',
        resize: true,
        data: Data,
        parseTime: false,
        xkey: 'y',
        ykeys: ['item1'],
        labels: ['Return'],
        gridLineColor: '#082242',
        lineColors: ['#2771d3'],
        lineWidth: 2,
        hideHover: 'auto'
      });
    }else{
      var line = new Morris.Line({
        element: 'morris-line-chart',
        resize: true,
        data: Data,
        parseTime: false,
        xkey: 'y',
        ykeys: ['item1'],
        labels: ['Profit'],
        gridLineColor: '#082242',
        lineColors: ['#2771d3'],
        lineWidth: 2,
        hideHover: 'auto'
      });
    }
  })
 })