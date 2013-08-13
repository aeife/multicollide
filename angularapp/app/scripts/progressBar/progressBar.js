'use strict';

angular.module('progressBar', [])
  .directive('progressBar', function () {
    return {
      restrict: 'E',
      scope: {
        progress: '@',
      },
      templateUrl: 'scripts/progressBar/progressBar.html',
      controller: function($scope, $element, $attrs) {
        $scope.getStyle = function(){
          return {'width': $attrs.progress + '%'};
        };
      }
    };
  });

  // alternative:
  //
  // angular.module('progressBar', [])
  // .directive('progressBar', function () {
  //   return function($scope, $element, $attrs) {
  //     console.log('DIRECT');
  //     console.log($attrs.progressBar);
  //     $scope.$watch($attrs.progressBar, function(val) {
  //       $element.html('<div class='progress-bar' style='width: ' + val + '%'></div>');
  //     });
  //  }
  // });

