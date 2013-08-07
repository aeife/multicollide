'use strict';

var states = function(){

  return {
    GAME: {
      BROWSER: 'browser',
      LOBBY: '_GameLobby_',
      INGAME: '_GameIngame_'
    }
  };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = states;
} else {
  angular.module('STATES', [])
  .factory('STATES', states);
}
