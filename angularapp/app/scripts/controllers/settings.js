'use strict';

angular.module('angularappApp')
  .controller('SettingsCtrl', function ($scope, user, auth, flash) {
    $scope.loggedIn = auth.isLoggedIn();
    console.log(auth.isLoggedIn());

    $scope.changePassword = function(){
        if ($scope.newpasswordForm.$invalid) {
            flash.error("wrong input");
        } else if ($scope.newPassword != $scope.newPasswordConfirm) {
            flash.error("passwords do not match");
        } else {
            user.changePassword(auth.key(), $scope.oldPassword, $scope.newPassword, function(data){
                console.log(data);
                if (data.error)
                    flash.error(data.error);
                else
                    flash.info("successfully updates password");
            });
        }
    }
    

  });
