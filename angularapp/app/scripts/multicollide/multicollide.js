'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player', 'multicollide.canvasRender', 'multicollide.config'])
  .controller('MulticollideCtrl', function ($scope, level, Player, canvasRender, config, lobby, $rootScope, socketgenapi, STATES) {
    // initialization
    // already happens when opening server browser
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var bgCanvas = $('#bgCanvas');
    var bgCtx = document.getElementById('bgCanvas').getContext('2d');
    var textCanvas = $('#textCanvas');
    var textCtx = document.getElementById('textCanvas').getContext('2d');
    var wrapper = $('#wrapper');

    var sound = new Howl({
      urls: ['sounds/beep.ogg', 'sounds/beep.wav'],
      autoplay: false,
      loop: false,
      volume: 0.5,
      onend: function() {
        console.log('Finished!');
      }
    });


    var spriteSheet = new Image();
    spriteSheet.src = '/images/spritesheet.png';

    var players;
    var ownPlayer;
    var countdownInterval;
    var turnListener;
    var gameEndListener;
    var lobbyLeaveListener;
    var lobbyPlayerLeftListener;
    var endEmitted;

    spriteSheet.onload = function() {
      initalize();
    };

    // reinitialize on lobby leave
    socketgenapi.lobby.leave.on(function(){

      // if player left during countdown, clear countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      initalize();
    }).forRoute();

    function initalize(){
      players = null;
      ownPlayer = null;
      endEmitted = false;

      level.init({gridSize: config.gridSize});
      canvasRender.init({canvas: {background: bgCanvas, game: canvas, text: textCanvas}, layer: {background: bgCtx, game: ctx, text: textCtx}, wrapper: wrapper, spriteSheet: spriteSheet});
    }

    // initalize the rest when game starts
    socketgenapi.lobby.start.on(function(){
      // initialize players
      players = lobby.currentLobby.players;
      ownPlayer = null;

      for (var i = 0; i < players.length; i++){
        var newPlayer = new Player(players[i], 'red', STATES.MULTICOLLIDE.DIRECTION.SOUTH, 0);
        if (players[i] === $rootScope.username){
          ownPlayer = newPlayer;
        }
        level.addPlayer(newPlayer);
      }
      level.spawnPlayers();


      // start signal and countdown
      socketgenapi.multicollide.start.on(function(){

        var countdown = 3;
        canvasRender.drawText(countdown);
        countdownInterval = setInterval(function(){
          countdown--;
          canvasRender.clearText();

          if (countdown > 0) {
            canvasRender.drawText(countdown);
          } else {
            clearInterval(countdownInterval);
            // if host send game start
            if (ownPlayer.username === lobby.currentLobby.host){
              socketgenapi.multicollide.start.emit();
            }
          }
        },1000);

      }).once();

      // set listeners if not exist

      // kill player on lobby leave
      if (!lobbyPlayerLeftListener){
        lobbyPlayerLeftListener = socketgenapi.lobby.player.left.on(function(data){
          level.playerForUsername[data.username].kill();
        });
      }

      // game loop
      if (!turnListener){
        turnListener = socketgenapi.multicollide.turn.on(function(data){
          level.processTurn(data);
          console.log("BOOL: ");
          // if host and game ended: wait a bit and then emit game ending once
          console.log(!endEmitted);
          if (ownPlayer.username === lobby.currentLobby.host && level.gameEnded && !endEmitted){
            console.log("EMITTING END");
            setTimeout(function(){
              socketgenapi.multicollide.end.emit({});
            }, 1000);
            endEmitted = true;
          }
        });
      }

      // listen for game ending
      if (!gameEndListener){
        gameEndListener = socketgenapi.multicollide.end.on(function(){
          lobby.status = STATES.GAME.LOBBY;
          lobby.lastStandings = level.standings;
          level.gameEnded = false;
          endEmitted = false;
        });
      }

      // listen for lobby leave (includes lobby deleted)
      if (!lobbyLeaveListener){
        lobbyLeaveListener = socketgenapi.lobby.leave.on(function(){
          turnListener.stop();
          lobbyPlayerLeftListener.stop();
        }).once();
      }


      // @TODO: allow press different key while other is still pressed
      var keyEventFired = false;
      document.onkeydown = function(e) {
        if (!keyEventFired) {
          keyEventFired = true;

          if (e.keyCode === config.controls.default.up || e.keyCode === config.controls.alternate.up){
            changeDirection(STATES.MULTICOLLIDE.DIRECTION.NORTH);
            // sound.play();
          } else if (e.keyCode === config.controls.default.down || e.keyCode === config.controls.alternate.down){
            changeDirection(STATES.MULTICOLLIDE.DIRECTION.SOUTH);
            // sound.play();
          } else if (e.keyCode === config.controls.default.left || e.keyCode === config.controls.alternate.left){
            changeDirection(STATES.MULTICOLLIDE.DIRECTION.WEST);
            // sound.play();
          } else if (e.keyCode === config.controls.default.right || e.keyCode === config.controls.alternate.right){
            changeDirection(STATES.MULTICOLLIDE.DIRECTION.EAST);
            // sound.play();
          }
        }
      };

      document.onkeyup = function(e) {
        keyEventFired = false;
      };
    }).forRoute();



    function changeDirection(direction){

      if (validDirectionChange(direction)) {
        // console.log("change to " + direction.value);
        socketgenapi.multicollide.changeDirection.emit({direction: direction});
      }
    }

    function validDirectionChange(direction){
      // valid direction change: not current direction and not opposite direction
      return ((ownPlayer.direction.value !== direction.value) && (direction.value !== STATES.MULTICOLLIDE.DIRECTION[ownPlayer.direction.opposite].value));
    }

    $scope.fullscreen = function(){
      // @TODO: check in other browsers (firefox: not centered, ie: not working, opera: ?, safari: ?)
      console.log('GO FULLSCREEN');
      var full = document.getElementById('canvasWrapper');
      if (full.requestFullScreen) {
        full.requestFullScreen();
      } else if (full.webkitRequestFullScreen) {
        full.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (full.mozRequestFullScreen) {
        full.mozRequestFullScreen();
      }

      document.fullScreen = function (e){
        console.log('EE');
      };

      var count = 0;
      $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
        count++;
        if(count%2){
          canvasRender.setFullscreen();
          console.log('Go to Full Screen mode');
        } else {
          canvasRender.exitFullscreen();
          console.log('Exit Full Screen mode');
        }
      });
    };

    $scope.showGame = function(){
      return lobby.status === STATES.GAME.INGAME;
    };
  });
