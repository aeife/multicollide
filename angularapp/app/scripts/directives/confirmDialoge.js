'use strict';

angular.module('angularappApp')
  .factory('popup', function ($rootScope) {
    return {
      content: {title: 'test'},
      confirm: function(title, text, confirmFunction, cancelFunction){
        console.log('entering popup service');
        this.content = {title: title, text: text, confirmFunction: confirmFunction, cancelFunction: cancelFunction};
        $rootScope.$broadcast('showPopup');
      }
    };
  })
  .directive('confirmDialoge', function (popup, auth,$rootScope) {
    return {
      templateUrl: 'views/confirmDialoge.html',
      restrict: 'E',
      controller: function($scope, popup){
        console.log('confirm box');
        $scope.hide = true;

        $rootScope.$on('showPopup', function(){
          $scope.hide = false;
          console.log(popup.content);
          $scope.content = popup.content;
        });

        console.log(popup.status);

        $scope.confirm = function(){
          $scope.hide = true;
          $scope.content.confirmFunction();
        };

        $scope.cancel = function(){
          $scope.hide = true;
        };
      }
    };
  });
