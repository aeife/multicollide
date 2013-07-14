'use strict';

angular.module('games', [])
  .controller('GamesCtrl', function ($scope, lobby, flash, $dialog, $location, $rootScope, $filter) {
    $scope.order = 'name';
    $scope.reverse = false;
    $scope.lobby = lobby;

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
      $scope.dialogCreateGame.open()
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
      return username === lobby.currentLobby.host;
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

    // @TODO: Leave Lobby on F5 / refresh / tab close
    $scope.leaveGame = function(){
      lobby.leaveLobby();
    };

    // only process first of the two events below
    var eventProcessed = false;

    // leave lobby on location change
    // @TODO: weird behavior when changing to START btn
    $scope.$on('$locationChangeStart', function(event, next, current) {
      // if user was in lobby, leave
      console.log(lobby.inLobby);
      if (!eventProcessed && lobby.inLobby){
        event.preventDefault();
        $dialog.messageBox($filter('i18n')('_LeaveLobby_'), $filter('i18n')('_LeaveLobbyReally_'), [{result:true, label: $filter('i18n')('_Yes_'), cssClass: 'btn-primary'}, {result:false, label: $filter('i18n')('_Cancel_')}])
        .open()
        .then(function(result){
          if (result) {
            $scope.leaveGame();
            eventProcessed = true;
            // @TODO: redirect location to clicked location
            // $location.path('/about');
            // $location.url(next).hash();
          }
        });
      }
    });

    // leave lobby on logout
    $rootScope.$on('event:logout:before', function(){
      if (!eventProcessed && lobby.inLobby){
        $scope.leaveGame();

        eventProcessed = true;
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
    }
  });
