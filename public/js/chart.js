google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

var chart;
var data;
var message = "";
var dateLine = [];
var featureLine = [];
var timeGiven = true;
var height = Math.floor(0.28 * window.innerHeight);
var container = document.getElementById('chart_div');
var noAlt = document.getElementsByClassName("underside");
var maxDist = 0;
var mapData = [];
var newData = [];

function chartToMapInteraction(index) {
  var closestPoint = featureLine[index];
  if (point === null) {
    point = new ol.geom.Point(closestPoint);
  } else {
    point.setCoordinates(closestPoint);
  }
  map.render();
}

function formatToolTip(d, alt, dist) {
  var altInfo = '';
  var distInfo = '';
  var timeInfo = '';
  if (timeGiven) {
    var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var day = week[d.getDay()];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[d.getMonth()];
    var date = d.getDate();
    var year = d.getFullYear();
    var hours = d.getHours();
    var mins = d.getMinutes();
    var secs = d.getSeconds();
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (mins < 10) {
      mins = "0" + mins;
    }
    if (secs < 10) {
      secs = "0" + secs;
    }
    timeInfo = day + ", " + date + " " + month + " " + year  + " " + 
      hours + ":" + mins + ":" + secs;
  }

  altInfo = alt.toFixed(2) + "m";
  distInfo = "Distance: " + dist.toFixed(2) + "m";

  if (timeGiven) {
    return altInfo + '\n' + distInfo + '\n' + timeInfo;
  } else {
    return altInfo + '\n' + distInfo;
  }
}


function updateData() {
  return newData;
}

function getOptions(h, maxDist) {
  var options = {
    legend: 'none',
    areaOpacity: 0.5,
    height: h,
    chartArea: {
      left: 6,
      top: 0,
      right: 6,
      bottom: 0,
      height: h
    },
    hAxis: {
      format: '0',
      baseline: {
        color: '#333'
      },
      textPosition: 'in',
      textStyle: {
        fontSize: 12
      },
      viewWindow: {
        min: 0,
        max: maxDist
      },
      gridlines: {
        units: {
          numbers: {format: ['decimal']}
        }
      },
      minorGridlines: {
        units: {
          numbers: {format: ['short']},
          
        }
      }
    },
    vAxis: {
      format: '0',
      textPosition: 'in',
      textStyle: {
        fontSize: 12
      },
      viewWindowMode: 'pretty',
      gridlines: {
        units: {
          numbers: {format: ['decimal']}
        }
      }
    },
    lineWidth: 1,
    colors: ['#7F7C5E'],
    tooltip: { trigger: 'both', isHtml: true},
    crosshair: { trigger: 'both', orientation: 'vertical', color: '#262626', selected: { color: '#7F7C5E' }, focused: { color: '#7F7C5E' }},

  };
  return options;
}

function drawChart() {

  mapData = updateData();

  if (mapData[0] == undefined || mapData[2] == 0 || mapData[0][2] == 0 ) {
    timeGiven = false;
    if (noAlt.length > 0) {
      noAlt[0].classList.remove("hidden");
    }
    return;
  }

  if (mapData[3] == 0 || mapData[0][3] == 0) {
    timeGiven = false;
  }

  data = new google.visualization.DataTable();
  data.addColumn('number', 'Distance');
  data.addColumn('number', 'Altitude');
  data.addColumn({type: 'string', role: 'tooltip', 'p': { html: true }});
  
  for (var i=0; i< mapData.length; i++) {
    var dist = 0;
    var date = 0;
    if ( i != 0 ) {
      var coord1 = ol.proj.toLonLat([mapData[i - 1][0], mapData[i - 1][1]]); // gives [lon, lat] array
      var coord2 = ol.proj.toLonLat([mapData[i][0], mapData[i][1]]);
      dist = new ol.Sphere(6371e3).haversineDistance(coord1, coord2);
    }
    maxDist += dist;
    featureLine.push(mapData[i]);
    if (timeGiven) {
      date = new Date();
      date.setTime(mapData[i][3]*1000);
      dateLine.push(date.valueOf());
    }
    data.addRow([maxDist, mapData[i][2], formatToolTip(date, mapData[i][2], maxDist)]);
  }

  var options = {
    legend: 'none',
    areaOpacity: 0.5,
    height: height,
    chartArea: {
      left: 6,
      top: 0,
      right: 6,
      bottom: 0,
      height: height
    },
    hAxis: {
      format: '0',
      baseline: {
        color: '#333'
      },
      textPosition: 'in',
      textStyle: {
        fontSize: 12
      },
      viewWindow: {
        min: 0,
        max: maxDist
      },
      gridlines: {
        units: {
          numbers: {format: ['decimal']}
        }
      },
      minorGridlines: {
        units: {
          numbers: {format: ['short']},
          
        }
      }
    },
    vAxis: {
      format: '0',
      textPosition: 'in',
      textStyle: {
        fontSize: 12
      },
      viewWindowMode: 'pretty',
      gridlines: {
        units: {
          numbers: {format: ['decimal']}
        }
      }
    },
    lineWidth: 1,
    colors: ['#7F7C5E'],
    tooltip: { trigger: 'both', isHtml: true},
    crosshair: { trigger: 'both', orientation: 'vertical', color: '#262626', selected: { color: '#7F7C5E' }, focused: { color: '#7F7C5E' }},

  };

  chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
  chart.draw(data, options);

  // Add mouseover/out handlers for mousing over points.
  google.visualization.events.addListener(chart, 'onmouseout', pointMouseOut);

  container.addEventListener('mousemove', function(e) {
    var cli = chart.getChartLayoutInterface();
    var xPos = e.pageX - container.offsetLeft;
    var yPos = e.pageY - container.offsetTop;
    var xBounds = cli.getBoundingBox('hAxis#0#gridline');
    var yBounds = cli.getBoundingBox('vAxis#0#gridline');
    // Find the row index that matches the x-value
    if (
        (xPos >= xBounds.left || xPos <= xBounds.left + xBounds.width) &&
        (yPos >= yBounds.top || yPos <= yBounds.top + yBounds.height) 
    ) {
    
      var xVal = cli.getHAxisValue(xPos);
      var rows = data.getFilteredRows([{'column': 0, 'minValue': parseFloat(xVal).toFixed(2) - 50}]);
      if (rows.length) {
        chart.setSelection([{'row': rows[0], 'column': 0}, {'row': rows[0], 'column': 1}]);
        // Update map based on row selected
        chartToMapInteraction(rows[0]);
      }

      var selection = chart.getSelection();
      google.visualization.events.addOneTimeListener(chart, 'ready', function() {
          chart.setSelection(selection);
      });
      height = Math.floor(0.28 * window.innerHeight);
      var options = getOptions(height, maxDist);
      chart.draw(data, options);
    }

  });


  window.addEventListener('resize', function(e) {
    window.setTimeout( function() { 
      height = Math.floor(0.28 * window.innerHeight);
      var options = getOptions(height, maxDist);
      chart.draw(data, options);
    }, 200);
  });
}


