'use strict';

angular.module('angularappAppMock.localization', [])
 .factory('localization', function($rootScope){
  this.events = {};
  this.getLocalizationKeys = function(){
    return [];
  };
  return this;
});
