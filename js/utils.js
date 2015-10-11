/** Utilities file for the Midpoint Application
 *  @author Antares Chen
 *  @author Oghenochuko Eyemaro
 *  @author Connor Killion
 *  @author Patrick Lee
 */

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

/** Returns a map centered at the midpoint of start and end, given API object
 *  and map. */
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

/** Returns the fastest pedestrian route between start and end. */
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

/** Returns the fastest driver route between start and end. */
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

/** Returns the fastest public transport route between start and end. */
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
