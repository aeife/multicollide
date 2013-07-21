'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player', 'multicollide.canvasRender', 'multicollide.config'])
  .controller('MulticollideCtrl', function ($scope, level, Player, canvasRender, config) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var bgCanvas = $('#bgCanvas');
    var bgCtx = document.getElementById('bgCanvas').getContext('2d');
    var wrapper = $('#canvasWrapper');

    var sound = new Howl({
      urls: ['sounds/beep.ogg', 'sounds/beep.wav'],
      autoplay: false,
      loop: false,
      volume: 0.5,
      onend: function() {
        console.log('Finished!');
      }
    });
    // var sound = new Howl({
    //   urls: ['/sounds/beep.ogg']
    // });

    var spriteSheet = new Image();
    spriteSheet.src = '/images/spritesheet.png';

    spriteSheet.onload = function() {

      level.init({gridSize: config.gridSize});
      canvasRender.init({canvas: {background: bgCanvas, game: canvas}, layer: {background: bgCtx, game: ctx}, wrapper: wrapper, spriteSheet: spriteSheet});
      // level.generateFood(15,5);
      // console.log(imageObj);
      // console.log(imageObj2);
      // var p1 = new Player('red', "east", {linear: imageLinear, corner: imageCorner, head: imageHead, tail: imageTail});
      var p1 = new Player('red', "east", 0);

      p1.spawn(1,1);
      setInterval(function(){
        p1.move();
      },50);

      // @TODO: allow press different key while other is still pressed
      var keyEventFired = false;
      document.onkeydown = function(e) {
        console.log(keyEventFired);
        if (!keyEventFired) {
          keyEventFired = true;

          switch(e.keyCode) {
            case 87:
              // key W
              p1.changeDirection("north");
              sound.play();
              break;
            case 65:
              // key A
              p1.changeDirection("west");
              sound.play();
              break;
            case 83:
              // key S
              p1.changeDirection("south");
              sound.play();
              break;
            case 68:
              // key D
              p1.changeDirection("east");
              sound.play();
              break;
            case 84:
              // key t
              // for testing
              p1.kill();
              break;
          };
        }
      };

      document.onkeyup = function(e) {
        keyEventFired = false;
      };
    };

    $scope.fullscreen = function(){
      // @TODO: check in other browsers (firefox: not centered, ie: not working, opera: ?, safari: ?)
      console.log("GO FULLSCREEN");
      var full = document.getElementById("canvasWrapper");
      // level.fullscreen = true;
      // level.setFullscreen();
      // canvas.css("position", "relative");
      // bgCanvas.css("position", "relative");
      if(full.requestFullScreen)
          full.requestFullScreen();
      else if(full.webkitRequestFullScreen)
          full.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      else if(full.mozRequestFullScreen)
          full.mozRequestFullScreen();

      document.fullScreen = function (e){
        console.log("EE");
      }

      var count = 0;
      $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
        count++;
        if(count%2){
          canvasRender.setFullscreen();
          console.log('Go to Full Screen mode');
        }else{
          canvasRender.exitFullscreen();
         console.log('Exit Full Screen mode');
        }
      });

        // window.setTimeout(function(){canvas.css("position", "absolute");bgCanvas.css("position", "absolute");}, 1000);
        // canvas.css("position", "absolute");
      // bgCanvas.css("position", "absolute");

    }
  });
