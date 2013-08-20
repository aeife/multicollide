'use strict';

// generate game modules array from config
appConfig.gameModules = [];
for (var game in appConfig.games){
  appConfig.gameModules.push(appConfig.games[game].module);
}

// concat all game modules as dependencies
angular.module('games', ['games.game', 'games.gameList', 'games.lobby'].concat(appConfig.gameModules))
  .controller('GamesCtrl', function () {

  });
