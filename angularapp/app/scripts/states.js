'use strict';

(function(){

  var states = function(){
    return {
      GAME: {
        LOBBY: {value: 'game.lobby', toString: '_Lobby_'},
        INGAME: {value: 'game.ingame', toString: '_Ingame_'}
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

})();
