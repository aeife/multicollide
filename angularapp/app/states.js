'use strict';

var states = function(){

  return {
    GAME: {
      BROWSER: {value: 'game.browser', toString: '_ServerBrowser_'},
      LOBBY: {value: 'game.lobby', toString: '_Lobby_'},
      INGAME: {value: 'game.ingame', toString: '_GameIngame_'}
    }
  };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = states;
} else {
  angular.module('STATES', [])
  .factory('STATES', states);
}
