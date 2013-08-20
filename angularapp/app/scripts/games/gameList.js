'use strict';

angular.module('games.gameList', [])
  .controller('GameListCtrl', function ($scope) {
    $scope.appConfig = appConfig;
  });
