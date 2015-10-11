
/**
 * Moves the map to display over Berlin
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
function moveMapToBerlin(map){
  map.setCenter({lat:52.5159, lng:13.3777});
  map.setZoom(14);
}


//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  app_id: 'rIiShqffvZj8EyDeOq15',
  app_code: 'Wnf__6rH5EoRKTr8WlHI7w',
  useCIT: true,
  useHTTPS: true
});
var defaultLayers = platform.createDefaultLayers();

      // Instantiate a map inside the DOM element with id map. The
      // map center is in San Francisco, the zoom level is 10:
      var map = new H.Map(document.getElementById('map'),
        platform.createDefaultLayers().normal.map, {
          center: {lat: 37.7942, lng: -122.4070},
          zoom: 15
        });

      // Create a group object to hold map markers:
      var group = new H.map.Group();

      // Create the default UI components:
      var ui = H.ui.UI.createDefault(map, platform.createDefaultLayers());

      // Add the group object to the map:
      map.addObject(group);

        // Obtain a Search object through which to submit search
        // requests:
      var search = new H.places.Search(platform.getPlacesService()),
            searchResult, error;

        // Define search parameters:
      var params = {
      // Plain text search for places with the word "hotel"
        // associated with them:
        'q': 'going-out', // we want to make this a variable
      //  Search in the Chinatown district in San Francisco:
        'at': '37.7942,-122.4070'
      };

        // Define a callback function to handle data on success:
      function onResult(data) {
        addPlacesToMap(data.results);
      }

        // Define a callback function to handle errors:
      function onError(data) {
        error = data;
      }

        // This function adds markers to the map, indicating each of
        // the located places:
      function addPlacesToMap(result) {
        group.addObjects(result.items.map(function (place) {
          var marker = new H.map.Marker({lat: place.position[0],
                lng: place.position[1]})
          return marker;
        }));
      }

        // Run a search request with parameters, headers (empty), and
        // callback functions:
      search.request(params, {}, onResult, onError);


//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

function get_places_of_interest(platform, category, location, radius) {
  var locale = location.lat + "," + location.lng + ";r=" + radius;
  var explorer = new H.places.Explore(platform.getPlacesService());
  var params = {
    'cat' : category,
    'in' : locale
  };
  explorer.request(params, {}, onResult,
    log("Error on places-of-interest request")
  );
}

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
  router.calculateRoute(params, onSuccess,
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
  router.calculateRoute(params, onSuccess,
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
  router.calculateRoute(params, onSuccess,
    log("Error on map public-transportation route request.")
  );
}
