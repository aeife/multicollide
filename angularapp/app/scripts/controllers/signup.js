'use strict';

angular.module('angularappApp')
  .controller('SignupCtrl', function ($scope, auth, flash) {
    $scope.signup = function(){
        if ($scope.signupForm.$invalid) {
            flash.error("wrong input")
        } else if ($scope.password != $scope.passwordConfirm) {
            flash.error("passwords do not match")
        } else {
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

    // $scope.on("form.$invalid", function(){
    //     console.log("test");
    // });

  $scope.flash = flash;

  $scope.test = function(){
    flash.delete();
  }
});
