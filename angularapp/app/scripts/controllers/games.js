'use strict';

angular.module('angularappApp')
  .controller('GamesCtrl', function ($scope, lobby) {
  	$scope.games = null;
  	$scope.order = "name";
  	$scope.reverse = false;

  	console.log("requesting games");
  	lobby.getAvailableGames(function(data){
  		console.log("controller got data");
  		console.log(data);
  		$scope.games = data;
  	});

  	$scope.reorder = function(attr){
  		if (attr === $scope.order){
  			$scope.reverse = !$scope.reverse;
  		} else {
  			$scope.order = attr;
  			$scope.reverse = false;
  		}
  	}
  });
