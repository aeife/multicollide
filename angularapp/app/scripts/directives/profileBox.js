'use strict';

angular.module('angularappApp')
  .directive('profileBox', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/profileBox.html',
      controller: function($scope){
        $scope.templateUrl = 'views/profileBoxGuest.html';

        $scope.changeStatus = function(){
            $scope.templateUrl = 'views/profileBoxUser.html';
        };

      }
      /*link: function postLink(scope, element, attrs) {
        element.text('this is the profileBox directive');
      }*/
    };
  });
