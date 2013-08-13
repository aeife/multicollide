'use strict';

angular.module('eloBox', [])
  .directive('eloBox', function () {
    return {
      restrict: 'E',
      scope: {
        number: '=',
        size: '='
      },
      templateUrl: 'scripts/directives/eloBox.html',
      controller: function($scope, $rootScope, $attrs){
        if ($scope.size < 25) {
          $scope.borderSize = 1;
        } else {
          $scope.borderSize = 2;
        }

        if (!$scope.number) {
          $scope.guest = 'G';
        } else {
          $scope.guest = undefined;
        }

        $scope.getStyle = function(){
          return {
            'display': 'inline-block',
            'border': $scope.borderSize + 'px solid #666',
            'color': '#666',
            'text-align': 'center',
            'font-size': $attrs.size + 'px',
            'line-height':($attrs.size * 0.8) + 'px',
            'padding': $attrs.size * 0.2 + 'px',
            'height': ($attrs.size * 1.2) + 'px',
            'width': ($attrs.size * 1.6) + 'px',
            'font-weight': 'bold',
            'background-color': '#dddddd'
          };
        };
      }
    };
  });
