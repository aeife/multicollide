'use strict';

angular.module('angularappApp')
  .controller('GamesCtrl', function ($scope, lobby) {
  	$scope.games = null;

  	console.log("requesting games");
  	lobby.getAvailableGames(function(data){
  		console.log("controller got data");
  		console.log(data);
  		$scope.games = data;
  	});
  });
