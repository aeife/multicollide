'use strict';

angular.module('angularappApp')
  .controller('SettingsCtrl', function ($scope, user, auth, flash, localization) {

    if (auth.isLoggedIn()){
      user.getUserInfo(auth.key(), function(data){

        if (data) {
          $scope.user = data;
        } else {
        }
      });
    }

    $scope.changePassword = function(){
      if ($scope.newpasswordForm.$invalid) {
        flash.error('wrong input');
      } else if ($scope.newPassword !== $scope.newPasswordConfirm) {
        flash.error('passwords do not match');
      } else {
        user.changePassword(auth.key(), $scope.oldPassword, $scope.newPassword, function(data){
          console.log(data);
          if (data.error){
            flash.error(data.error);
          } else {
            flash.info('successfully updates password');
          }
        });
      }
    };

    $scope.languages = localization.getAvailableLanguages();
    $scope.language = localization.getCurrentLanguage();
    $scope.changeLanguage = function(){
      console.log('changing language to ' + $scope.language);
      localization.changeLanguage($scope.language);
    };
  });
