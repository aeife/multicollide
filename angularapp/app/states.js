'use strict';

var states = function(){

  return {
    GAME: {
      BROWSER: 'browser',
      LOBBY: 'lobby',
      INGAME: 'ingame'
    }
  };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = states;
} else {
  angular.module('STATES', [])
  .factory('STATES', states);
}
