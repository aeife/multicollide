'use strict';

angular.module('angularappApp')
  .controller('GamesCtrl', function ($scope, lobby) {
    $scope.games = null;
    $scope.order = "name";
    $scope.reverse = false;

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
    }

    $scope.createGame = function(){
      lobby.newLobby();
    }

    $scope.refresh = function(){
      lobby.getAvailableGames(function(data){
        console.log(data);
        $scope.games = data;
      });
    }

    $scope.refresh();
  });
