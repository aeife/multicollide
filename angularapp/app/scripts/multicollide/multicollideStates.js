'use strict';

var states = function(){
  return {
    GAME: {
      LOBBY: {value: 'game.lobby', toString: '_Lobby_'},
      INGAME: {value: 'game.ingame', toString: '_Ingame_'}
    },
    MULTICOLLIDE: {
      DIRECTION: {
        NORTH: {value: 'multicollide.direction.north', toString: '_North_', toDegree: -90, opposite: 'SOUTH'},
        SOUTH: {value: 'multicollide.direction.south', toString: '_South_', toDegree: 90, opposite: 'NORTH'},
        WEST: {value: 'multicollide.direction.west', toString: '_West_', toDegree: 180, opposite: 'WEST'},
        EAST: {value: 'multicollide.direction.east', toString: '_East_', toDegree: 0, opposite: 'EAST'}
      }
    }
  };

  // return stateObj;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = states;
} else {
  angular.module('STATES', [])
  .factory('STATES', states);
}
