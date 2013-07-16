'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player'])
  .controller('MulticollideCtrl', function ($scope, level, Player) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var wrapper = $('#canvasWrapper');

    level.init({canvas: canvas, ctx: ctx, wrapper: wrapper});

    var imageLinear = new Image();
    imageLinear.src = 'images/c-linear.png';

    var imageHead = new Image();
    imageHead.src = 'images/c-head.png';

    var imageTail = new Image();
    imageTail.src = 'images/c-tail.png';

    var imageCorner = new Image();
    imageCorner.src = 'images/c-corner.png';

    var imageA = new Image();
    imageA.src = 'images/a-linear.png';

    imageCorner.onload = function() {
      // console.log(imageObj);
      // console.log(imageObj2);
      // var p1 = new Player('red', "east", {linear: imageLinear, corner: imageCorner, head: imageHead, tail: imageTail});
      var p1 = new Player('red', "east", {linear: imageA, corner: imageA, head: imageA, tail: imageA});

      p1.spawn(1,1);
      setInterval(function(){
        p1.move();
      },50);

      document.onkeydown = function(e) {
        switch(e.keyCode) {
          case 87:
            // entspricht Taste W
            p1.changeDirection("north");
            break;
          case 65:
            // entspricht Taste A
            p1.changeDirection("west");
            break;
          case 83:
            // entspricht Taste S
            p1.changeDirection("south");
            break;
          case 68:
            // entspricht Taste D
            p1.changeDirection("east");
            break;
        };
      };
    };





  });
