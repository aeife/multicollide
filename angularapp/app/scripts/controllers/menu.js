'use strict';

angular.module('angularappApp')
  .controller('MenuCtrl', function ($scope, $location) {
    $scope.activePath = null;
    $scope.$on('$routeChangeSuccess', function(){
        $scope.activePath = $location.path();
        console.log( $location.path() );
    });
  });
