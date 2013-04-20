'use strict';

angular.module('angularappApp')
  .controller('SignupCtrl', function ($scope, auth) {
    $scope.signup = function(){
        if ($scope.password === $scope.passwordRepeat) {
            auth.signup($scope.username, $scope.password, function(data){
                $scope.error = data.error;
            });
        }
    }
  });
