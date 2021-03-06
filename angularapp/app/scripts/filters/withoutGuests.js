'use strict';

angular.module('filters')
  .filter('withoutGuests', function () {
    return function (input) {
      return input.filter(function(el){
        if (el.name) {
          return el.name.indexOf('Guest') === -1 || el.name.indexOf('Guest') > 0;
        } else {
          return el.indexOf('Guest') === -1 || el.indexOf('Guest') > 0;
        }
      });
    };
  });
