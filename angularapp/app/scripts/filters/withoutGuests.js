'use strict';

angular.module('angularappApp')
  .filter('withoutGuests', function () {
    return function (input) {
      console.log(input);
      return input.filter(function(el){
        if (el.name) {
          return el.name.indexOf('Guest') === -1 || el.name.indexOf('Guest') > 0;
        } else {
          return el.indexOf('Guest') === -1 || el.indexOf('Guest') > 0;
        }
      });
    };
  });
