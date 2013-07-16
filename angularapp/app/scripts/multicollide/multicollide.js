'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player'])
  .controller('MulticollideCtrl', function ($scope, level, Player) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var wrapper = $('#canvasWrapper');

    level.init({canvas: canvas, ctx: ctx, wrapper: wrapper});

    var imageObj = new Image();
    imageObj.src = 'images/p.png';
    imageObj.onload = function() {
      var p1 = new Player('red', "east", imageObj);

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
