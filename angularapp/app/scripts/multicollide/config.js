'use strict';

angular.module('multicollideGame.config', ['STATES'])
  .factory('config', function ($rootScope, MULTICOLLIDESTATES) {
    // Service logic

    // Public API here
    var config = {
      gridSize: {width: 50, height: 30},
      player: {
        startLength: 5
      },
      spawnLocations: {
        solo: function(count){
          var playerDistance = 4;
          return [
            (count <= 4) ? {x: 1, y: Math.floor(config.gridSize.height/2), direction: MULTICOLLIDESTATES.DIRECTION.EAST} : {x: 1, y: Math.floor(config.gridSize.height/2) - playerDistance, direction: MULTICOLLIDESTATES.DIRECTION.EAST},
            (count <= 5) ? {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2), direction: MULTICOLLIDESTATES.DIRECTION.WEST} : {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2) - playerDistance, direction: MULTICOLLIDESTATES.DIRECTION.WEST},
            (count <= 6) ? {x: Math.floor(config.gridSize.width/2), y: 1, direction: MULTICOLLIDESTATES.DIRECTION.SOUTH} : {x: Math.floor(config.gridSize.width/2) - playerDistance, y: 1, direction: MULTICOLLIDESTATES.DIRECTION.SOUTH},
            (count <= 7) ? {x: Math.floor(config.gridSize.width/2), y: config.gridSize.height - 1, direction: MULTICOLLIDESTATES.DIRECTION.NORTH} : {x: Math.floor(config.gridSize.width/2) - playerDistance, y: config.gridSize.height - 2, direction: MULTICOLLIDESTATES.DIRECTION.NORTH},
            {x: 1, y: Math.floor(config.gridSize.height/2) + playerDistance, direction: MULTICOLLIDESTATES.DIRECTION.EAST},
            {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2) + playerDistance, direction: MULTICOLLIDESTATES.DIRECTION.WEST},
            {x: Math.floor(config.gridSize.width/2) + playerDistance, y: 1, direction: MULTICOLLIDESTATES.DIRECTION.SOUTH},
            {x: Math.floor(config.gridSize.width/2) + playerDistance, y: config.gridSize.height - 2, direction: MULTICOLLIDESTATES.DIRECTION.NORTH},
            {x: 1, y: Math.floor(config.gridSize.height/2), direction: MULTICOLLIDESTATES.DIRECTION.EAST},
            {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2), direction: MULTICOLLIDESTATES.DIRECTION.WEST},
          ];
        }
      },
      controls: {
        default: {
          up: 87,
          down: 83,
          left: 65,
          right: 68
        },
        alternate: {
          up:  38,
          down: 40,
          left: 37,
          right:  39
        }
      }
    };
    return config;
  });
