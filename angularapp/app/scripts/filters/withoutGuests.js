'use strict';

angular.module('angularappApp')
  .filter('withoutGuests', function () {
    return function (input) {
    	console.log(input);
      return input.filter(function(el){return el.indexOf("Guest") === -1 || el.indexOf("Guest") > 0})
    };
  });
