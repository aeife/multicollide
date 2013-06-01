'use strict';

angular.module('angularappApp')
  .filter('i18n', function (localization) {
    return function (input, args) {
      console.log(args);
      console.log("LOCALIZING " + input);
      return localization.getLocalizedValue(input, args);
    };
  });
