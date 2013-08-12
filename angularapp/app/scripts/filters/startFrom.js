'use strict';

angular.module('filters')
  .filter('startFrom', function() {
    return function(input, start) {
      if (input) {
        return input.slice(start);
      }
    };
  });
