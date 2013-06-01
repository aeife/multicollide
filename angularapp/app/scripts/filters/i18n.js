'use strict';

angular.module('angularappApp')
  .filter('i18n', function () {

    var locale_EN = {
      _TESTTEXT_: {
        value: "This is a test."
      }
    };

    var locale_DE = {
      _TESTTEXT_: {
        value: "Das ist ein Test."
      }
    };

    var localize = locale_EN;
    return function (input) {
      console.log("INPUT:");
      console.log(input);
      return localize[input].value;
    };
  });
