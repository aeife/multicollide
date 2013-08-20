'use strict';

// generate game modules array from config
angular.appConfig.gameModules = [];
for (var game in angular.appConfig.games){
  angular.appConfig.gameModules.push(angular.appConfig.games[game].module);
}

// concat all game modules as dependencies
angular.module('games', ['games.game', 'games.gameList', 'games.lobby'].concat(angular.appConfig.gameModules))
  .controller('GamesCtrl', function () {

  });
