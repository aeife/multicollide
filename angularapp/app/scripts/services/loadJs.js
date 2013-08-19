'use strict';

angular.module('loadJs', [])
.service('loadJs', function($compile){

  return {
    add: function(url){
      angular.element('head').append('<script src="' + url + '">');
    }
  };
});
