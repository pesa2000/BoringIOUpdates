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
})

ipc.on("ReturnedDataGraphsMorris",(event,arg)=>{
  var Data = arg.DATAGRAPHS
  console.log("DATAGRAPHS")
  console.log(Data)
  "use strict";

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
})