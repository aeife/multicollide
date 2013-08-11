'use strict';

angular.module('multicollideMock.localization', [])
 .factory('localization', function($rootScope){
  this.events = {};
  this.getLocalizationKeys = function(){
    return [];
  };
  return this;
});
