// Initialize the platform object:
var platform = new H.service.Platform({
  'app_id': 'rIiShqffvZj8EyDeOq15',
  'app_code': 'Wnf__6rH5EoRKTr8WlHI7w'
});

var maptypes = platform.createDefaultLayers();

$(document).ready(function() {
  var map = new H.Map(
    document.getElementById('mapContainer'),
    maptypes.normal.map,
    {
      zoom: 10,
      center: { lng: 13.4, lat: 52.51 }
  });

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
    $("body").css({"transform": "translate3d(0, -75vh, 0)", "-webkit-transition": "transform 1.5s", "-moz-transition": "transform 1.5s", "transition": "transform 1.5s"});
    // center_map(H, map, address1, address2);
    console.log(address1, address2, type1);
  });
});
