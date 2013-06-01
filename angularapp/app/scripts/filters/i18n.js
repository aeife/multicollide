'use strict';

angular.module('angularappApp')
  .filter('i18n', function (localization) {
    return function (input, args) {
      return localization.getLocalizedValue(input, args);
    };
  });
