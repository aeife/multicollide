'use strict';

angular.module('angularappApp')
  .filter('i18n', function (localization) {
    return function (input) {
      return localization.getLocalizedValue(input);
    };
  });
