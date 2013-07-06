'use strict';

angular.module('menu', [])
  .controller('MenuCtrl', function ($scope, $location) {
    $scope.activePath = null;
    $scope.$on('$routeChangeSuccess', function(){
      $scope.activePath = $location.path();
    });
  });
