$(document).ready(function() {
  // $(document).keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13) {
  //     $('#submit').click();
  //     return false;
  //   }

  // $('#submit').click(function() {
  //    $("body").css({"transform": "translate3d(0, 1000px, 0)"});
  // });

  $("#navInfo").submit(function(e) {
    e.preventDefault();
    $("body").css({"transform": "translate3d(0, -75vh, 0)", "-webkit-transition": "transform 2s"});
    var address1 = $("#add1").val();
    var address2 = $("#add2").val();
    var type1 = $("#type1").val();
    console.log("hello world");
    console.log(address1, address2, type1);
  });
});
