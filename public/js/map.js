var fileSelect = document.getElementById('fileToUpload');
var customFileUpload = document.getElementById('customFileUpload');
var uploadSelection = document.getElementById('fileSubmit');
var chart_button = document.getElementsByClassName("buttonBorder")[0];
var body = document.getElementsByTagName("body")[0];
var msg = document.getElementById("message");


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

// Set up standard style of trail routes
var style = {
  'Point': new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'rgba(51,51,51,0.4)'
      }),
      radius: 3,
      stroke: new ol.style.Stroke({
        color: '#f00',
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

var point = null;
var s = osm;


if (fileSelect) {
  fileSelect.addEventListener("change", function(e) {
    uploadSelection.classList.toggle('hidden');
    fileSelect.classList.toggle('hidden');
    customFileUpload.classList.toggle('hidden');
    var str = fileSelect.value;
    var base = str.substr(str.lastIndexOf('\\') + 1);
    document.uploadForm.file_path.value = base;
    document.uploadForm.submit.value = "Upload " + base;
  });
}

if (customFileUpload) {
  customFileUpload.addEventListener("click", function (e) {
    document.uploadForm.file_choose.value = "clicked";
  })
}

// Set up layer from file upload
function uploadFile(str) {
  if (str == "") {
    return;
  } else {
    var fileUploaded = str;
    if (fileUploaded && fileUploaded != "") {
      s = new ol.source.Vector({
        url: fileUploaded,
        format: new ol.format.GPX()
      });
      var newLayer = new ol.layer.Vector({
        source: s,
        style: styleFunction,
      });
    
      map.addLayer(newLayer);

      // When passing a url argument using openlayers, ol.source.Vector is asynchronously loaded.
      // Need to wait until it's fully loaded to get features and proceed to fit map and chart new layer.
      s.on('change', function(event) {
        var source = event.target;
        if (source.getState() === 'ready') {
          var polygon = s.getExtent();
          var size = /** @type {ol.Size} */ (map.getSize());
          map.getView().fit(polygon, size);
          var features = s.getFeatures();
          for (var i = 0; i< features.length; i++) {
            var shape = features[i].getGeometry();
            if (Object.prototype.toString.call(shape.getCoordinates()[0]) === '[object Array]') {
              newData = newData.concat(shape.getCoordinates()[0]);
            } else {
              newData = newData.concat([shape.getCoordinates()]);
            }
          }
          drawChart();
        }
      });
      
      mapChartInteraction(s);
      
    }
  }
};


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
        var date = new Date(closestPoint[3] * 1000);
        myMapHoverHandler(date);
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


// default zoom, center and rotation
var zoom = 2, center = [0, 0], rotation = 0;

// Create the initial map with the overview map, base tiles.
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
  })
});

if (chart_button) {
  chart_button.addEventListener('click', function(e) {
    var mappy = document.getElementById("map");
    var extent = s.getExtent();
    mappy.classList.toggle("shrink");
    map.updateSize();
    if (extent) {
      map.getView().fit(extent, map.getSize());
    }
  });
}

// Allows map to interact with chart
function myMapHoverHandler(date) {
  var index = dateLine.indexOf(date.valueOf());
  if (index > 0) {
    chart.setSelection([{'row': index, 'column': 0}, {'row': index, 'column': 1}]);
  }
  var selection = chart.getSelection();
  google.visualization.events.addOneTimeListener(chart, 'ready', function() {
      chart.setSelection(selection);
  });
}


function pointMouseOut(e) {
  chart.setSelection([{'row': null, 'column': null}]);
  var selection = chart.getSelection();
  google.visualization.events.addOneTimeListener(chart, 'ready', function() {
      chart.setSelection(selection);
  });
}

window.addEventListener('resize', function(e) {
  window.setTimeout( function() { 
    var extent = s.getExtent();
    if (extent) {
      map.getView().fit(extent, map.getSize());
    }
  }, 200);
});

body.onload = function () {
  if (msg) {
    msg.classList.remove("hidden");
  }
}

if (msg) {
  msg.addEventListener('click', function(e) {
    msg.classList.add("hidden");
  });
}



