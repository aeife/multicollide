'use strict';

angular.module('signup', [])
  .controller('SignupCtrl', function ($scope, auth, flash) {
    $scope.signedup = false;

    $scope.signup = function(){
      if ($scope.signupForm.$invalid) {
        flash.error('wrong input');
      } else if ($scope.password !== $scope.passwordConfirm) {
        flash.error('passwords do not match');
      } else {
        auth.signup({username: $scope.username, password: $scope.password, email: $scope.email}, function(data){
          if (data.error) {
            flash.error(data.error);
          } else {
            $scope.signedup = true;
          }
        });
      }
    };
    $scope.flash = flash;
  });