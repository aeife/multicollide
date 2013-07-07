'use strict';

angular.module('settings', [])
  .controller('SettingsCtrl', function ($scope, user, auth, flash, localization) {

    $scope.isLoggedIn = auth.isLoggedIn;

    if ($scope.isLoggedIn()){
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
            flash.info('successfully updated password');
          }
        });
      }
    };

    $scope.languages = localization.getAvailableLanguages();
    $scope.language = localization.getCurrentLanguage();
    $scope.changeLanguage = function(){
      console.log('changing language to ' + $scope.language);
      localization.changeLanguage($scope.language);

      // save change on server if logged in
      if ($scope.isLoggedIn()){
        user.changeLanguageSetting($scope.language);
      }
    };
  });
