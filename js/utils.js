/** Utilities file for the Midpoint Application
 *  @author Antares Chen
 *  @author Oghenochuko Eyemaro
 *  @author Connor Killion
 *  @author Patrick Lee
 */


<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  <link rel="stylesheet" type="text/css"
    href="https://js.api.here.com/v3/3.0/mapsjs-ui.css" />
  <script type="text/javascript" charset="UTF-8"
    src="https://js.api.here.com/v3/3.0/mapsjs-core.js"></script>
  <script type="text/javascript" charset="UTF-8"
    src="https://js.api.here.com/v3/3.0/mapsjs-service.js"></script>
  <script type="text/javascript" charset="UTF-8"
    src="https://js.api.here.com/v3/3.0/mapsjs-ui.js"></script>
  <script type="text/javascript" charset="UTF-8"
    src="https://js.api.here.com/v3/3.0/mapsjs-mapevents.js"></script>

</head>
<body>
  <div id="map" style="width: 100%; height: 400px; background: grey" />
  <script  type="text/javascript" charset="UTF-8" >

/**
 * Moves the map to display over Berlin
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
//function moveMapToBerlin(map){
//  map.setCenter({lat:52.5159, lng:13.3777});
  //map.setZoom(14);
//}

/**
 * Boilerplate map initialization code starts below:
 */

//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  app_id: 'rIiShqffvZj8EyDeOq15',
  app_code: 'Wnf__6rH5EoRKTr8WlHI7w',
  useCIT: true,
  useHTTPS: true
});
var defaultLayers = platform.createDefaultLayers();

//Step 2: initialize a map  - not specificing a location will give a whole world view.
var map = new H.Map(document.getElementById('map'),
  defaultLayers.normal.map);

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

/** Returns a list of places based on location and radius. */
function get_places_of_interest(platform, category, location, radius) {
  var locale = location.lat + "," + location.lng + ";r=" + radius;
  var explorer = new H.places.Explore(platform.getPlacesService());
  var params = {
    'cat' : category,
    'in' : locale
  };
  return explorer.request(params, {}, onResult,
    log("Error on places-of-interest request")
  );
}

/** Returns the longitude and latitude coordinates for a string address. */
function get_coordinates(platform, address) {
  var geocoder = platform.getGeocodingService(),
    params = {
      searchText : address,
      jsonattributes : 1
    };
  return geocoder.geocode(params, onSuccess, log("Error on geocoding request"));
}

/** Returns the midpoint of two locations. Assert that location has lat, lng. */
function get_midpoint(location1, location2) {
  x = (location1.lat + location2.lat) / 2;
  y = (location2.lng + location2.lng) / 2;
  return {lat : x, lng : y};
}

function center_map(H, map, start, end) {
  midpoint = get_midpoint(start, end);
  map.setCenter(midpoint);
  var vertical_buffer = 0.025;
  var horizontal_buffer = 0.05;
  var top_right = {
    lat1 : Math.max(start.lat, end.lat) + vertical_buffer,
    lng1 : Math.min(start.lng, end.lng) - horizontal_buffer
  };
  var bottom_left = {
    lat2 : Math.min(start.lat, end.lat) - vertical_buffer,
    lng2 : Math.max(start.lng, end.lng) + horizontal_buffer
  };
  var bounds = new H.geo.Rect(top_right.lat1, top_rightlng1,
                              bottom_left.lat2, bottom_left.lng2);
  map.setViewBounds(bounds);
  return map;
}
function route_pedestrian_map(platform, map, start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'fastest;pedestrian',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start,
      waypoint1 : end
    };
  return router.calculateRoute(params, onSuccess,
    log("Error on map pedestrian route request.")
  );
}
function route_drive_map(platform, map, start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'shortest;car',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start,
      waypoint1 : end
    };
  return router.calculateRoute(params, onSuccess,
    log("Error on map driver route request.")
  );
}
function route_public_transporation_map(platform, map, start, end) {
  var router = platform.getRoutingService()
    params = {
      mode : 'shortest;publicTransport',
      representation : 'display',
      routeattributes : 'waypoints,summary,shape,legs',
      maneuverattributes : 'direction,action',
      waypoint0 : start,
      waypoint1 : end
    };
  return router.calculateRoute(params, onSuccess,
    log("Error on map public-transportation route request.")
  );
}
// Now use the map as required...
  </script>
</body>
</html>
