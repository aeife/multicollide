'use strict';

angular.module('angularappApp')
  .controller('GamesCtrl', function ($scope, lobby, flash, $dialog) {
    $scope.games = null;
    $scope.order = 'name';
    $scope.reverse = false;
    $scope.inLobby = false;

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
      lobby.joinLobby(id, function(err, data){
        if (err) {
          flash.error(err);
          $scope.refresh();
        } else {
          console.log('successfull joined lobby');
          $scope.onJoinedLobby(data);
        }
      });
    };

    $scope.createGame = function(){
      lobby.newLobby(function(data){
        console.log('successfull created lobby');
        $scope.onJoinedLobby(data);
      });
    };

    $scope.refresh = function(){
      lobby.getAvailableGames(function(data){
        console.log(data);
        $scope.games = data;
      });
    };

    $scope.getLobbyCount = function(){
      if ($scope.games) {
        return Object.keys($scope.games).length;
      } else {
        return 0;
      }
    };

    $scope.onJoinedLobby = function (data){
      $scope.inLobby = true;
      $scope.lobby = data;

      lobby.onPlayerJoined(function(data){
        $scope.lobby.players.push(data.username);
      });

      lobby.onPlayerLeft(function(data){
        if ($scope.lobby.players.indexOf(data.username) > -1){
          $scope.lobby.players.splice($scope.lobby.players.indexOf(data.username), 1);
        }
      });

      lobby.onLobbyDeleted(function(data){
        flash.error(data.reason);
        $scope.onLeftLobby();
      });
    };

    $scope.isHost = function(username){
      return username === $scope.lobby.host;
    };

    $scope.onLeftLobby = function () {
      $scope.inLobby = false;
      $scope.lobby = null;

      $scope.refresh();
    };

    $scope.btnLeaveGame = function(){
      $dialog.messageBox('Leave Lobby', 'Really leave lobby?', [{result:true, label: 'Yes', cssClass: 'btn-primary'}, {result:false, label: 'Cancel'}])
        .open()
        .then(function(result){
          if (result) {
            $scope.leaveGame();
          }
        });
    };

    // @TODO: Leave Lobby on F5 / refresh / tab close
    $scope.leaveGame = function(){
      lobby.leaveLobby($scope.lobby.id, function(data){
        console.log('left lobby');
        console.log(data);
        $scope.onLeftLobby();
      });
    };

    $scope.$on('$routeChangeStart', function() {
      // if user was in lobby, leave
      if ($scope.lobby){
        $scope.leaveGame();
      }
    });

    $scope.refresh();
  });
