'use strict';

angular.module('multicollideGame', ['multicollideGame.level', 'multicollideGame.player', 'multicollideGame.canvasRender', 'multicollideGame.config', 'multicollideGame.STATES'])
  .controller('multicollideGameCtrl', function ($scope, level, Player, canvasRender, config, lobby, $rootScope, websocketApi, STATES, MULTICOLLIDESTATES) {
    // initialization
    console.log("MULTICOLLIDE START");
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
    spriteSheet.src = '/scripts/multicollide/spritesheet.png';

    var players;
    var ownPlayer;
    var countdownInterval;
    var turnListener;
    var gameStartListener;
    var gameEndListener;
    var lobbyLeaveListener;
    var lobbyPlayerLeftListener;
    var endProcessed;

    // initialize game when spriteSheet is loaded
    spriteSheet.onload = function() {
      initialize();
    };

    /* handle game close */

    // game ends
    gameEndListener = websocketApi.multicollide.end.on(function(){
      postprocess();
      lobby.status = STATES.GAME.LOBBY;
    });

    // lobby leave (includes lobby deleted)
    lobbyLeaveListener = websocketApi.lobby.leave.on(function(){
      postprocess();
    }).once();

    function postprocess(){
      gameEndListener.stop();
      turnListener.stop();
      gameStartListener.stop();
      lobbyLeaveListener.stop();
      lobbyPlayerLeftListener.stop();
      canvasRender.removeAutoResize();
    }

    /* host started game: initialize*/
    function initialize(){
      canvasRender.init({canvas: {background: bgCanvas, game: canvas, text: textCanvas}, layer: {background: bgCtx, game: ctx, text: textCtx}, wrapper: wrapper, spriteSheet: spriteSheet});
      level.init({gridSize: config.gridSize});

      players = lobby.currentLobby.players;
      ownPlayer = null;

      for (var i = 0; i < players.length; i++){
        var newPlayer = new Player(players[i].name, 'red', MULTICOLLIDESTATES.DIRECTION.SOUTH, i);
        if (players[i].name === $rootScope.username){
          ownPlayer = newPlayer;
        }
        level.addPlayer(newPlayer);
      }
      level.spawnPlayers();

      /* Listeners */

      // start signal and countdown
      gameStartListener = websocketApi.multicollide.start.on(function(){
        var countdown = 3;
        canvasRender.drawText(countdown);
        countdownInterval = setInterval(function(){
          countdown--;
          canvasRender.clearText();

          if (countdown > 0) {
            canvasRender.drawText(countdown);
          } else {
            clearInterval(countdownInterval);
            canvasRender.clearAllText();
            // if host send game start
            if (lobby.currentLobby && ownPlayer.username === lobby.currentLobby.host){
              websocketApi.multicollide.start.emit();
            }
          }
        },1000);
      }).once();

      // kill player during game on lobby leave
      lobbyPlayerLeftListener = websocketApi.lobby.player.left.on(function(data){
        if (lobby.status && lobby.status.value === STATES.GAME.INGAME.value) {
          level.processPlayerLeave(data.username);
        }
      });

      // game loop
      turnListener = websocketApi.multicollide.turn.on(function(data){
        level.processTurn(data);

        // process end if not done
        if (!endProcessed) {
          lobby.lastStandings = level.standings;
          lobby.lastStandings.reverse();

          // if host and game ended: wait a bit and then emit game ending with standings
          if (ownPlayer.username === lobby.currentLobby.host && level.gameEnded){

            setTimeout(function(){

              var standings = level.standings;
              console.log("##standings:");
              console.log(standings);
              websocketApi.multicollide.end.emit({game: lobby.game, standings: standings});
            }, 1000);
            endProcessed = true;
          }
        }
      });



      // @TODO: allow press different key while other is still pressed
      var keyEventFired = false;
      document.onkeydown = function(e) {
        if (!keyEventFired) {
          keyEventFired = true;

          if (e.keyCode === config.controls.default.up || e.keyCode === config.controls.alternate.up){
            changeDirection(MULTICOLLIDESTATES.DIRECTION.NORTH);
            // sound.play();
          } else if (e.keyCode === config.controls.default.down || e.keyCode === config.controls.alternate.down){
            changeDirection(MULTICOLLIDESTATES.DIRECTION.SOUTH);
            // sound.play();
          } else if (e.keyCode === config.controls.default.left || e.keyCode === config.controls.alternate.left){
            changeDirection(MULTICOLLIDESTATES.DIRECTION.WEST);
            // sound.play();
          } else if (e.keyCode === config.controls.default.right || e.keyCode === config.controls.alternate.right){
            changeDirection(MULTICOLLIDESTATES.DIRECTION.EAST);
            // sound.play();
          }
        }
      };

      document.onkeyup = function(e) {
        keyEventFired = false;
      };
    }





    function changeDirection(direction){

      if (validDirectionChange(direction)) {
        // console.log("change to " + direction.value);
        websocketApi.multicollide.changeDirection.emit({direction: direction});
      }
    }

    function validDirectionChange(direction){
      // valid direction change: not current direction and not opposite direction
      return ((ownPlayer.direction.value !== direction.value) && (direction.value !== MULTICOLLIDESTATES.DIRECTION[ownPlayer.direction.opposite].value));
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

