'use strict';

angular.module('games.game', [])
  .controller('GameCtrl', function ($scope, lobby, flash, $location, $rootScope, $filter, user, STATES) {

    $scope.order = 'name';
    $scope.reverse = false;
    $scope.lobby = lobby;
    $scope.user = user;
    $scope.STATES = STATES;

    //MOCK
    // $scope.lobby.lastStandings = [['Player1'], ['Player2'], [], ['Player3A', 'Player3B'], ['Player4']]

    $scope.playerLimits = [];
    // generate player limit array
    for (var i = 2; i <= lobby.maxplayers; i++) {
      $scope.playerLimits.push(i);
    }

    // set default player limit
    $scope.maxplayers = 2;

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

    $scope.createGame = function (lobbyName, maxplayers){
      lobby.newLobby(lobbyName, maxplayers);
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

    // @TODO: Reset multicollide, lobby, players and so on
    $scope.leaveGame = function(){
      lobby.leaveLobby();
    };

    // leave lobby on location change
    // @TODO: weird behavior when changing to START btn
    var locationChangeStartListener = $scope.$on('$locationChangeStart', function(event, next, current) {
      // if user was in lobby and not logged out before: leave
      if (lobby.inLobby){
        event.preventDefault();
        $('#leaveGameModal').modal('show');
      }
    });

    $scope.refresh();
  })
