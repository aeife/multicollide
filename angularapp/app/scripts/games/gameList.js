'use strict';

angular.module('games.gameList', [])
  .controller('GameListCtrl', function ($scope, localization) {
    $scope.appConfig = appConfig;

    $scope.getLocalDescription = function(description){
      // look up description for current language
      // if no translation is available use english
      var currentLanguage = localization.getCurrentLanguage();
      if (description[currentLanguage]){
        return description[currentLanguage];
      } else {
        return description['en-US'];
      }
    };
  });
