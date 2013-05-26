'use strict';

angular.module('angularappApp')
  .controller('GamesCtrl', function ($scope, lobby) {
    $scope.games = null;
    $scope.order = "name";
    $scope.reverse = false;
    $scope.inLobby = false;

    $scope.reorder = function(attr){
      if (attr === $scope.order){
        $scope.reverse = !$scope.reverse;
      } else {
        $scope.order = attr;
        $scope.reverse = false;
      }
    }

    $scope.joinGame = function(id){
      console.log("trying to join game with id " + id);
      lobby.joinLobby(id, function(data){
        console.log("successfull joined lobby");
        $scope.onJoinedLobby(data);
      });
    }

    $scope.createGame = function(){
      lobby.newLobby(function(data){
        console.log("successfull created lobby");
        $scope.onJoinedLobby(data);
      });
    }

    $scope.refresh = function(){
      lobby.getAvailableGames(function(data){
        console.log(data);
        $scope.games = data;
      });
    }

    $scope.onJoinedLobby = function (data){
      $scope.inLobby = true;
      $scope.lobby = data;
    }

    $scope.refresh();
  });
