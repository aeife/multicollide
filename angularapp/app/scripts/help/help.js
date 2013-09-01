'use strict';

angular.module('help', [])
  .controller('HelpCtrl', function ($scope, localization) {
    $scope.appConfig = appConfig;
    $scope.gameHelp = $scope.appConfig.games[0].name;

    $scope.changeGame = function(game){
      $scope.gameHelp = game;
    };

    // @TODO: exclude to localization service
    $scope.getLocalText = function(text){
      // look up description for current language if text is defined in config
      // if no translation is available use english
      if (text) {
        var currentLanguage = localization.getCurrentLanguage();
        if (text[currentLanguage]){
          return text[currentLanguage];
        } else {
          if (text['en-US']) {
            return text['en-US'];
          } else {
            return '';
          }
        }
      }
    };
  });
