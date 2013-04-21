'use strict';

angular.module('angularappApp')
  .controller('SignupCtrl', function ($scope, auth) {
    $scope.signup = function(){
        if ($scope.password === $scope.passwordRepeat) {
            auth.signup($scope.username, $scope.password, function(data){
                if(!$scope.$$phase) {
                    $scope.$apply(function () {
                       $scope.error = data.error;
                    });
                } else {
                    $scope.error = data.error;
                }
                // $scope.error = data.error;
            });
        }
    }

    $scope.test = function(){
        console.log("test valid signup");
    }
  });
