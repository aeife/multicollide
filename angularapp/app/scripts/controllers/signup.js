'use strict';

angular.module('angularappApp')
  .controller('SignupCtrl', function ($scope, auth, flash) {
    $scope.signedup = false;

    $scope.signup = function(){
      if ($scope.signupForm.$invalid) {
        flash.error('wrong input');
      } else if ($scope.password !== $scope.passwordConfirm) {
        flash.error('passwords do not match');
      } else {
        auth.signup($scope.username, $scope.password, function(data){
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
