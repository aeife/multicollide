'use strict';

(function(){

  var states = function(){
    return {
      DIRECTION: {
        NORTH: {value: 'direction.north', toString: '_North_', toDegree: -90, opposite: 'SOUTH'},
        SOUTH: {value: 'direction.south', toString: '_South_', toDegree: 90, opposite: 'NORTH'},
        WEST: {value: 'direction.west', toString: '_West_', toDegree: 180, opposite: 'WEST'},
        EAST: {value: 'direction.east', toString: '_East_', toDegree: 0, opposite: 'EAST'}
      }
    };
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = states;
  } else {
    angular.module('multicollideGame.STATES', [])
    .factory('MULTICOLLIDESTATES', states);
  }

})();
