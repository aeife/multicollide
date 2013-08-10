'use strict';

angular.module('eloBox', [])
  .directive('eloBox', function () {
    return {
      restrict: 'E',
      scope: {
        number: "=",
        size: "="
      },
      templateUrl: 'scripts/directives/eloBox.html',
      controller: function($scope, $rootScope, $attrs){
        if ($scope.size < 25) {
          $scope.borderSize = 1;
        } else {
          $scope.borderSize = 2;
        }

        if (!$scope.number) {
          $scope.guest = "G";
        } else {
          $scope.guest = undefined;
        }
      }
    };
  });
