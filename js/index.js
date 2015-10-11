//Initialize Foundation JS... in case we need it
$(document).foundation();

//Initialize the platform object:
var platform = new H.service.Platform({
  app_id: 'rIiShqffvZj8EyDeOq15',
  app_code: 'Wnf__6rH5EoRKTr8WlHI7w',
  useCIT: true,
  useHTTPS: true
});

//Pull down the default map types from [here]
var defaultLayers = platform.createDefaultLayers(),
  map,
  panel,
  behavior,
  ui,
  bubble,
  meetingPoint,
  meetingPointCoords,
  startCoord,
  destCoord,
  address1,
  address2,
  category;

//The juicy stuff happens *slurp* *slurp*
$(document).ready(function() {
  //Initialize important things... like the map, and make it interactive
  map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.normal.map,
    {
      zoom: 15,
      center: { lng: -122.2728, lat: 37.8717 } //Berkeley, bitches
  });
  panel = document.getElementById('panelContainer');
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  ui = H.ui.UI.createDefault(map, defaultLayers);

  $(document).keypress(function (e) {
    var key = e.which;
    if(key == 13) {
      $('#navInfo').submit();
      return false;
    }
  });

  $('#searchAgain').click(function() {
    $('body').css({"transform": "translate3d(0, 0, 0)", "-webkit-transition": "transform 1.5s", "-moz-transition": "transform 1.5s", "transition": "transform 1.5s"});
    $('ul').remove();
    map.clearContent();
  })

  $("#navInfo").submit(function(e) {
    e.preventDefault();
    address1 = $("#add1").val();
    address2 = $("#add2").val();
    category = $("#type1").val();
    console.log(typeof category);
    console.log(address1, address2, category);
    if (address1 == "" || address2 == "") {
      location.reload();
      alert("You must enter two valid addresses!");
      throw new Error;
    }
    getLocation(address1, "start");
    getLocation(address2, "destination");
    $("body").css({"transform": "translate3d(0, -100vh, 0)", "-webkit-transition": "transform 1.5s", "-moz-transition": "transform 1.5s", "transition": "transform 1.5s"});
  });
});


/**===========================================================================*/

//Generic onError function to save some time
function onError(error) {
  console.log("Shit just broke, motherfucker!");
}

//Handles users opening text bubbles
function openBubble(position, text){
  if(!bubble){
    bubble =  new H.ui.InfoBubble(
    position,
    {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

//Return the nearby locations in the desired category
function placesNearby(center, category, radius) {
  var explore = new H.places.Explore(platform.getPlacesService());
  var params = {
    'cat': category,
    'in': center + ";r=" + radius.toString()
  };
  explore.request(params, {}, onResult, onError);
}

//Called if the request to Places.Here goes through
function onResult(result) {
  var places = result.results.items;
  if (places.length === 0) {
    placesNearby(meetingPointCoords, category, 15000);
  }
  addPlacesToMap(places);
  addPlacesToPanel(places);
}

function addPlacesToMap(places) {
  var group = new  H.map.Group();
  // add 'tap' event listener, that opens info bubble, to the group
  group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getPosition());
    openBubble(
      evt.target.getPosition(), evt.target.content);
  }, false);

  group.addObjects(places.map(function (place) {
    var marker = new H.map.Marker({lat: place.position[0], lng: place.position[1]})
    marker.content = '<div style="font-size: 1em; font-weight: 200; color: white; text-align:center" ><h4 style="color:inherit; text-align:center">' + place.title +
      '</h4><h5 style="color:inherit; text-align:center">' + place.category.title + '</h5>' + place.vicinity + '</div>';
    return marker;
  }));

  map.addObject(group);
  map.setViewBounds(group.getBounds());
}

function addPlacesToPanel(places){
  var nodeOL = document.createElement('ul'),
    i;
  nodeOL.style.fontSize = 'small';
  nodeOL.style.marginLeft ='5%';

  for (i = 0;  i < places.length; i += 1) {
    var li = document.createElement('li'),
      divLabel = document.createElement('div'),
      content =  '<strong style="font-size: large; color: white">' + places[i].title  + '</strong>';
      content += ' <span style="font-size:smaller; color: white">(' +  places[i].category.title + ')</span><br>';
      content +=  places[i].vicinity + '<br>';
      content += '<strong style="color: white">distance:</strong>' +  places[i].distance + 'm<hr />';

    divLabel.innerHTML = content;
    li.appendChild(divLabel);
    nodeOL.appendChild(li);
  }
  panel.appendChild(nodeOL);
}

//Convets the "raw dawg" address data into coordinates like fucking magic
function getLocation(address, id) {
  var geocoder = platform.getGeocodingService(),
    params = {
      searchText : address,
      jsonattributes : 1,
      requestId: id
    };

  geocoder.geocode(params, onSuccessLocation, onError);
}

//Called if the request to the Geocoding Service goes through
function onSuccessLocation(result) {
  //check the request ids
  if (result.response.metaInfo.requestId === "start") {
    startCoord = result.response.view[0].result[0].location.displayPosition;
  } else if (result.response.metaInfo.requestId === "destination") {
    destCoord = result.response.view[0].result[0].location.displayPosition;
  }

  //if both requests went through, do the good shit
  if (startCoord != null && destCoord != null) {
    routeDriveMap(startCoord, destCoord);
  }
}

//Returns the fastest driver route between start and end
function routeDriveMap(start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'fastest;car',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start.latitude.toString() + "," + start.longitude.toString(),
      waypoint1 : end.latitude.toString() + "," + end.longitude.toString()
    };
  router.calculateRoute(params, drawRoute, onError);
}

//Draw the route obtained by the routing on the map
function drawRoute(result) {
  var route = result.response.route[0];
  console.log(route);
  meetingPointCoords = result.response.route[0].shape[Math.floor(route.shape.length/2)];
  console.log(meetingPointCoords);
  var meetingPointCoordsS = meetingPointCoords.split(",");
  meetingPoint = {lat: meetingPointCoordsS[0], lng: meetingPointCoordsS[1]};
  map.setCenter(meetingPoint);

  if (route != null && meetingPoint != null) {
      addRouteShapeToMap(route, meetingPoint);
  }
}

//Logic for drawing the route and the midpoint on the map
function addRouteShapeToMap(route, meetingPoint){
  var strip = new H.geo.Strip(),
    routeShape = route.shape,
    polyline;

  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
    'fill="#9C9DAB" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}});

  var marker = new H.map.Marker({
    lat: meetingPoint.lat,
    lng: meetingPoint.lng},
    {icon: dotIcon});

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: '#33335D'
    }
  });
  // Add the polyline to the map
  map.addObject(polyline);
  map.addObject(marker);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);

  placesNearby(meetingPointCoords, category, 1000);
}

//Calculate fastest public tansit map
function routePublicTransporationMap(start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'shortest;publicTransport',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start,
      waypoint1 : end
    };
  return router.calculateRoute(params, onSuccess, onError);
}

//Calculate fastest walking route
function routePedestrianMap(start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'fastest;pedestrian',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start,
      waypoint1 : end
    };
  return router.calculateRoute(params, onSuccess, onError);
}
