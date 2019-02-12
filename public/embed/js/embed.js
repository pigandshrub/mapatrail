var chart;
var data;
var message = "";
var timeGiven = true;
var point = null;
var maxDist = 0;
var height = Math.floor(0.28 * window.innerHeight);
var noAlt = document.getElementsByClassName("underside");
var container = document.getElementById('chart_div');
var chart_button = document.getElementById("chartButton");
// default zoom, center and rotation
var zoom = 2, center = [0, 0], rotation = 0;
// Set up main map's base tiles
var osm = 
  new ol.layer.Tile({
    source: new ol.source.OSM({
      attributions: [
        'Maps © <a href="http://www.thunderforest.com/">Thunderforest</a>',
        ol.source.OSM.ATTRIBUTION
      ],
      url: 'https://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'
    })
  });
var vectorSource = osm;
// Set up standard style of trail routes
var style = {
  'Point': new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'rgba(51,51,51,0.4)'
      }),
      radius: 0,
      stroke: new ol.style.Stroke({
        color: '#ccc',
        width: 2
      })
    })
  }),
  'LineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(51,51,51,0.7)',
      width: 4
    })
  }),
  'MultiLineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(51,51,51,0.7)',
      width: 4
    })
  }),
  'icon': new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: new ol.style.Fill({
        color: 'rgba(51,51,51,0.4)'
      }),
      points: 3,
      radius: 6,
      stroke: new ol.style.Stroke({
        color: '#ccc',
        width: 2
      })
    })
  }),
  'geoMarker': new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      snapToPixel: false,
      fill: new ol.style.Fill({color: 'rgba(51,51,51,0.5)'}),
      stroke: new ol.style.Stroke({
        color: '#ccc', width: 1
      })
    })
  })
};


// Functions to style trail features
var styleFunction = function(feature, resolution) {
  var featureStyleFunction = feature.getStyleFunction();
  if (featureStyleFunction) {
    return featureStyleFunction.call(feature, resolution);
  } else {
    return style[feature.getGeometry().getType()];
  }
};

// Create the initial map with the overview map, base tiles, and drag and drop feature.
var map = new ol.Map({
  interactions: ol.interaction.defaults().extend([
    new ol.interaction.DragRotateAndZoom() ]),
  layers: [osm],
  target: document.getElementById('map'),
  view: new ol.View({
    center: center,
    zoom: zoom,
    rotation: rotation,
    minZoom: 2
  }),
  controls: ol.control.defaults({
    attributionOptions: {
     collapsible: false
    }
  }),
});

function mapChartInteraction(s) {

  var displaySnap = function(coordinate) {
    var closestFeature = s.getClosestFeatureToCoordinate(coordinate);
    if (closestFeature === null) {
      point = null;
    } else {
      var geometry = closestFeature.getGeometry();
      var closestPoint = geometry.getClosestPoint(coordinate);
      if (point === null) {
        point = new ol.geom.Point(closestPoint);
      } else {
        point.setCoordinates(closestPoint);
      }

      // Map interaction with the chart
      if (timeGiven) {
        var id = closestFeature.get('id');
        if (id !== undefined) {
          myMapHoverHandler(id); 
        }
      }

    }
    map.render();
  };

  var outStroke = new ol.style.Stroke({
    color: '#333',
    width: 1
  })
  var outStyle = new ol.style.Style({
    stroke: outStroke,
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.9)'
      }),
      stroke: outStroke
    })
  });

  map.on('postcompose', function(evt) {
    var vectorContext = evt.vectorContext;
    vectorContext.setStyle(outStyle);
    if (point !== null) {
      vectorContext.drawGeometry(point);
    }
  });

  // Set up how map reacts with a drag or click of a mouse
  map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    var coordinate = map.getEventCoordinate(evt.originalEvent);
    displaySnap(evt.coordinate);
  });

  map.on('click', function(evt) {
    var coordinate = map.getEventCoordinate(evt.originalEvent);
    displaySnap(evt.coordinate);
  });

}

function drawMap(trail) {
  var count = trail.length;
  var features = [];
  for (var i = 0; i < count-1; i++) {
    var line = new ol.geom.LineString();
    var coordinate1 = new ol.proj.fromLonLat([Number(trail[i][2]), Number(trail[i][1])]);
    var coordinate2 = new ol.proj.fromLonLat([Number(trail[i+1][2]), Number(trail[i+1][1])]);
    line.appendCoordinate(coordinate1);
    line.appendCoordinate(coordinate2);
    features[i] = new ol.Feature({ 'geometry': line, 'id': i });
  }


  vectorSource = new ol.source.Vector({
    features: features
  });

  map.addLayer(new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
  }));

  map.getView().fit(
    vectorSource.getExtent(), /** @type {ol.Size} */ (map.getSize()));

  mapChartInteraction(vectorSource);
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

function drawChart(trail) {

  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawIt);

  function chartToMapInteraction(index) {
    var lonlat = [Number(trail[index][2]), Number(trail[index][1])];
    var closestPoint = new ol.proj.fromLonLat(lonlat);
    if (point === null) {
      point = new ol.geom.Point(closestPoint);
    } else {
      point.setCoordinates(closestPoint);
    }
    map.render();
  }

  function formatToolTip(d, alt, dist) {
    var timeInfo = '';
    var altInfo = '';
    var distInfo = '';
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

  function drawIt() {

    if (trail[0] == undefined || Number(trail[0]['alt']) == 0 ) {
      timeGiven = false;
      if (noAlt.length > 0) {
        noAlt[0].classList.remove("hidden");
      }
      return;
    }

    if (Number(trail[0]['point_date']) == 0) {
      timeGiven = false;
    }

    data = new google.visualization.DataTable();
    data.addColumn('number', 'Distance');
    data.addColumn('number', 'Altitude');
    data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true }});
    
    for (var i=0; i< trail.length; i++) {
      var date = 0
      var dist = 0;
      if ( i != 0 ) {
        var coord1 = [Number(trail[i - 1]['lon']), Number(trail[i - 1]['lat'])]; // [lon, lat] array
        var coord2 = [Number(trail[i]['lon']), Number(trail[i]['lat'])];
        dist = new ol.Sphere(6371e3).haversineDistance(coord1, coord2);
      }
      maxDist += dist;
      if (timeGiven) {
        date = new Date(trail[i][4]);
      }
      data.addRow([maxDist, Number(trail[i][3]), formatToolTip(date, Number(trail[i][3]), maxDist)]);
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

}


chart_button.addEventListener('click', function(e) {
  var mappy = document.getElementById("map");
  mappy.classList.toggle("shrink");
  map.updateSize();
  var extent = vectorSource.getExtent();
  if (extent) {
    map.getView().fit(extent, map.getSize());
  }
});


// Allows map to interact with chart
function myMapHoverHandler(index) {
  chart.setSelection([{'row': index, 'column': 0}, {'row': index, 'column': 1}]);
  var selection = chart.getSelection();
  google.visualization.events.addOneTimeListener(chart, 'ready', function() {
      chart.setSelection(selection);
  });
}

// Deselects chart item when mouse moves out
function pointMouseOut(e) {
  chart.setSelection([{'row': null, 'column': null}]);
  var selection = chart.getSelection();
  google.visualization.events.addOneTimeListener(chart, 'ready', function() {
      chart.setSelection(selection);
  });
}

window.addEventListener('resize', function(e) {
  window.setTimeout( function() { 
    var extent = vectorSource.getExtent();
    if (extent) {
      map.getView().fit(extent, map.getSize());
    }
  }, 200);
});