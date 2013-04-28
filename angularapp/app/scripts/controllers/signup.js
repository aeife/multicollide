'use strict';

angular.module('angularappApp')
  .controller('SignupCtrl', function ($scope, auth, flash) {
    $scope.signup = function(){
        if ($scope.signupForm.$invalid) {
            flash.error("wrong input");
        } else if ($scope.password != $scope.passwordConfirm) {
            flash.error("passwords do not match");
        } else {
            auth.signup($scope.username, $scope.password, function(data){
                console.log(data);
                $scope.error = data.error;
                flash.error(data.error)
            });
        }
    }
    $scope.flash = flash;
  });
