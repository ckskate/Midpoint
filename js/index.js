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
var defaultLayers = platform.createDefaultLayers();
var map;
var behavior;
var ui;
var bubble;
var meetingPoint;
var startCoord;
var destCoord;

//The juicy stuff happens *slurp* *slurp*
$(document).ready(function() {
  //Initialize important things... like the map, and make it interactive
  map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.normal.map,
    {
      zoom: 15,
      center: { lng: -122.2728, lat: 37.8717 } //California, bitches
  });
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  ui = H.ui.UI.createDefault(map, defaultLayers);

  $(document).keypress(function (e) {
    var key = e.which;
    if(key == 13) {
      $('#navInfo').submit();
      return false;
    }
  });

  $('#submit').click(function() {
     $("body").css({"transform": "translate3d(0, 1000px, 0)"});
  });

  $("#navInfo").submit(function(e) {
    e.preventDefault();
    var address1 = $("#add1").val();
    var address2 = $("#add2").val();
    var type1 = $("#type1").val();
    if (address1 == "" || address2 == "") {
      location.reload();
      alert("You must enter two valid addresses!");
      throw new Error;
    }
    getLocation(address1, "start");
    getLocation(address2, "destination");
    $("body").css({"transform": "translate3d(0, -75vh, 0)", "-webkit-transition": "transform 1.5s", "-moz-transition": "transform 1.5s", "transition": "transform 1.5s"});
    console.log(address1, address2, type1);
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

/** Returns a list of places based on location and radius. */
function getPlacesOfInterest(category, location, radius) {
  var locale = location.latitude + "," + location.longitude + ";r=" + radius;
  var explorer = new H.places.Explore(platform.getPlacesService());
  var params = {
    'cat' : category,
    'in' : locale
  };
  return explorer.request(params, {}, onResult, onError);
}

/** Returns the location object for a string address. */
function getLocation(address, id) {
  var geocoder = platform.getGeocodingService(),
    params = {
      searchText : address,
      jsonattributes : 1,
      requestId: id
    };

  function onSuccess(result) {
    if (result.response.metaInfo.requestId === "start") {
      startCoord = result.response.view[0].result[0].location.displayPosition;
      console.log(startCoord);
    } else if (result.response.metaInfo.requestId === "destination") {
      destCoord = result.response.view[0].result[0].location.displayPosition;
      console.log(destCoord);
    }

    if (startCoord != null && destCoord != null) {
      centerMap(startCoord, destCoord);
      routeDriveMap(startCoord, destCoord);
    }
  }

  geocoder.geocode(params, onSuccess, onError);
}

/** Returns the midpoint of two locations. Assert that location has lat, lng. */
function getMidpoint(location1, location2) {
  console.log(location1.latitude);
  x = (location1.latitude + location2.latitude) / 2;
  y = (location2.longitude + location2.longitude) / 2;
  console.log(x, y);
  return {lat : x, lng : y};
}

/** Returns a map centered at the midpoint of start and end, given API object
 *  and map. */
function centerMap(start, end) {
  midpoint = getMidpoint(start, end);
  map.setCenter(midpoint);
  var vertical_buffer = 0.025;
  var horizontal_buffer = 0.05;
  var top_right = {
    lat1 : Math.max(start.latitude, end.latitude) + vertical_buffer,
    lng1 : Math.min(start.longitude, end.longitude) - horizontal_buffer
  };
  var bottom_left = {
    lat2 : Math.min(start.latitude, end.latitude) - vertical_buffer,
    lng2 : Math.max(start.longitude, end.longitude) + horizontal_buffer
  };
  var bounds = new H.geo.Rect(top_right.lat1, top_right.lng1,
                              bottom_left.lat2, bottom_left.lng2);
  map.setViewBounds(bounds);
}

/** Returns the fastest pedestrian route between start and end. */
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

/** Returns the fastest driver route between start and end. */
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
  var meetingPointCoords = result.response.route[0].shape[route.shape.length/2];
  meetingPointCoords = meetingPointCoords.split(",");
  meetingPoint = {latitude: meetingPointCoords[0], longitude: meetingPointCoords[1]};

  if (route != null && meetingPoint != null) {
      addRouteShapeToMap(route, meetingPoint);
  }
}

//Logic for drawing the route to the map
function addRouteShapeToMap(route, meetingPoint){
  var strip = new H.geo.Strip(),
    routeShape = route.shape,
    polyline;

  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
    'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}});

  var marker = new H.map.Marker({
    lat: meetingPoint.latitude,
    lng: meetingPoint.longitude},
    {icon: dotIcon});

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: 'rgba(0, 36, 73, 0.7)'
    }
  });
  // Add the polyline to the map
  map.addObject(polyline);
  map.addObject(marker);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
}

/** Returns the fastest public transport route between start and end. */
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
