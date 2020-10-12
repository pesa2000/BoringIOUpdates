// Dashboard 1 Morris-chart
/*var Data = require('electron').remote.getGlobal('GetGraphMonth')*/
var Data = require('electron').remote.getGlobal('DataMainGraphs') 
//console.log("Data nel file graphs")
//console.log(Data)

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

$(function() {
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