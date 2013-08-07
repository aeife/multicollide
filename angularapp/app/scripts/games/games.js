'use strict';

angular.module('games', [])
  .controller('GamesCtrl', function ($scope, lobby, flash, $dialog, $location, $rootScope, $filter, user, STATES) {
    $scope.order = 'name';
    $scope.reverse = false;
    $scope.lobby = lobby;
    $scope.user = user;
    $scope.STATES = STATES;

    $scope.reorder = function(attr){
      if (attr === $scope.order){
        $scope.reverse = !$scope.reverse;
      } else {
        $scope.order = attr;
        $scope.reverse = false;
      }
    };

    $scope.joinGame = function(id){
      console.log('trying to join game with id ' + id);
      lobby.joinLobby(id);
    };

    $scope.btnCreateGame = function(){
      $scope.dialogCreateGame = $dialog.dialog({templateUrl: 'scripts/games/msgCreateGame.html', backdropClick: false, keyboard: false, controller: 'CreateGameDialogCtrl'});
      $scope.dialogCreateGame.open();
    };

    $scope.createGame = function(){
      lobby.newLobby();
    };

    $scope.refresh = function(){
      lobby.getAvailableGames();
    };

    $scope.getLobbyCount = function(){
      if (lobby.games) {
        return Object.keys(lobby.games).length;
      } else {
        return 0;
      }
    };

    $scope.isHost = function(username){
      // only if in lobby, necessary because ng-show renders instantly
      if (lobby.currentLobby) {
        return username === lobby.currentLobby.host;
      }
    };

    $scope.btnReady = function(){
      lobby.startGame();
    };


    $scope.btnLeaveGame = function(){
      $dialog.messageBox($filter('i18n')('_LeaveLobby_'), $filter('i18n')('_LeaveLobbyReally_'), [{result:true, label: $filter('i18n')('_Yes_'), cssClass: 'btn-primary'}, {result:false, label: $filter('i18n')('_Cancel_')}])
        .open()
        .then(function(result){
          if (result) {
            $scope.leaveGame();
          }
        });
    };

    // @TODO: Reset multicollide, lobby, players and so on
    $scope.leaveGame = function(){
      lobby.leaveLobby();
    };

    // flag if logout event is triggered
    var gotLogout = false;

    // leave lobby on location change
    // @TODO: weird behavior when changing to START btn
    var locationChangeStartListener = $scope.$on('$locationChangeStart', function(event, next, current) {
      // if user was in lobby and not logged out before: leave
      if (!gotLogout && lobby.inLobby){
        event.preventDefault();
        $dialog.messageBox($filter('i18n')('_LeaveLobby_'), $filter('i18n')('_LeaveLobbyReally_'), [{result:true, label: $filter('i18n')('_Yes_'), cssClass: 'btn-primary'}, {result:false, label: $filter('i18n')('_Cancel_')}])
        .open()
        .then(function(result){
          if (result) {
            $scope.leaveGame();
            // @TODO: redirect location to clicked location
            // $location.path('/about');
            // $location.url(next).hash();
          }
        });
      } else {
        // if not in lobby and location change: remove listeners
      }
    });

    // leave lobby on logout
    var logoutBeforeListener = $rootScope.$on('event:logout:before', function(){
      if (lobby.inLobby){
        gotLogout = true;
        $scope.leaveGame();
      }
    });

    $scope.refresh();
  })

  .controller('CreateGameDialogCtrl', function ($scope, dialog, lobby) {
    $scope.lobby = lobby;

    $scope.playerLimits = [];
    // generate player limit array
    for (var i = 2; i <= lobby.maxplayers; i++) {
      $scope.playerLimits.push(i);
    }

    // set default player limit
    $scope.maxplayers = 2;

    $scope.createGame = function (lobbyName, maxplayers){
      dialog.close();
      lobby.newLobby(lobbyName, maxplayers);
    };

    $scope.cancel = function (){
      dialog.close();
    };
  });
