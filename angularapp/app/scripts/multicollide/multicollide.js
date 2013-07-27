'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player', 'multicollide.canvasRender', 'multicollide.config'])
  .controller('MulticollideCtrl', function ($scope, level, Player, canvasRender, config, lobby, $rootScope, socketgenapi) {
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

      // initialize players
      var players = lobby.currentLobby.players;
      var ownPlayer = null;
      for (var i = 0; i < players.length; i++){
        var newPlayer = new Player('red', 'south', 0);
        if (players[i] === $rootScope.username){
          ownPlayer = newPlayer;
        }
        level.players.push(newPlayer);
      }
      level.spawnPlayers();

      // game loop
      var turnListener = socketgenapi.multicollide.turn.on(function(){
        level.processTurn()
      });



      var lobbyDeleteListener = socketgenapi.lobby.deleted.on(function(){
        turnListener.stop();
        lobbyLeaveListener.stop();
      }).once();

      var lobbyLeaveListener = socketgenapi.lobby.leave.on(function(){
        turnListener.stop();
        lobbyDeleteListener.stop();
      }).once();

      // @TODO: allow press different key while other is still pressed
      var keyEventFired = false;
      document.onkeydown = function(e) {
        console.log(keyEventFired);
        console.log(e.keyCode);
        if (!keyEventFired) {
          keyEventFired = true;

          if (e.keyCode === config.controls.default.up || e.keyCode === config.controls.alternate.up){
            ownPlayer.changeDirection("north");
            // sound.play();
          } else if (e.keyCode === config.controls.default.down || e.keyCode === config.controls.alternate.down){
            ownPlayer.changeDirection("south");
            // sound.play();
          } else if (e.keyCode === config.controls.default.left || e.keyCode === config.controls.alternate.left){
            ownPlayer.changeDirection("west");
            // sound.play();
          } else if (e.keyCode === config.controls.default.right || e.keyCode === config.controls.alternate.right){
            ownPlayer.changeDirection("east");
            // sound.play();
          }
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
