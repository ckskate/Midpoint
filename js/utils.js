//Generic onError function to save some time
function onError(error) {
  console.log("Shit just broke, motherfucker!");
}


/** Returns a list of places based on location and radius. */
function getPlacesOfInterest(platform, category, location, radius) {
  var locale = location.lat + "," + location.lng + ";r=" + radius;
  var explorer = new H.places.Explore(platform.getPlacesService());
  var params = {
    'cat' : category,
    'in' : locale
  };
  return explorer.request(params, {}, onResult, onError);
}

/** Returns the location object for a string address. */
function getLocation(platform, address) {
  var geocoder = platform.getGeocodingService(),
    params = {
      searchText : address,
      jsonattributes : 1
    };

  function onSuccess(result) {
    console.log(result.response.view[0].result);
  }

  geocoder.geocode(params, onSuccess, onError);
}

/** Returns the midpoint of two locations. Assert that location has lat, lng. */
function getMidpoint(location1, location2) {
  x = (location1.lat + location2.lat) / 2;
  y = (location2.lng + location2.lng) / 2;
  return {lat : x, lng : y};
}

/** Returns a map centered at the midpoint of start and end, given API object
 *  and map. */
function centerMap(H, map, start, end) {
  midpoint = getMidpoint(start, end);
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
function routePedestrianMap(platform, map, start, end) {
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
function routeDriveMap(platform, map, start, end) {
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
    onError
  );
}

/** Returns the fastest public transport route between start and end. */
function routePublicTransporationMap(platform, map, start, end) {
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
