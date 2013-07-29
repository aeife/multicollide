'use strict';

angular.module('multicollide.config', [])
  .factory('config', function ($rootScope) {
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
            (count <= 4) ? {x: 1, y: Math.floor(config.gridSize.height/2), direction: 'east'} : {x: 1, y: Math.floor(config.gridSize.height/2) - playerDistance, direction: 'east'},
            (count <= 5) ? {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2), direction: 'west'} : {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2) - playerDistance, direction: 'west'},
            (count <= 6) ? {x: Math.floor(config.gridSize.width/2), y: 1, direction: 'south'} : {x: Math.floor(config.gridSize.width/2) - playerDistance, y: 1, direction: 'south'},
            (count <= 7) ? {x: Math.floor(config.gridSize.width/2), y: config.gridSize.height - 1, direction: 'north'} : {x: Math.floor(config.gridSize.width/2) - playerDistance, y: config.gridSize.height - 2, direction: 'north'},
            {x: 1, y: Math.floor(config.gridSize.height/2) + playerDistance, direction: 'east'},
            {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2) + playerDistance, direction: 'west'},
            {x: Math.floor(config.gridSize.width/2) + playerDistance, y: 1, direction: 'south'},
            {x: Math.floor(config.gridSize.width/2) + playerDistance, y: config.gridSize.height - 2, direction: 'north'},
            {x: 1, y: Math.floor(config.gridSize.height/2), direction: 'east'},
            {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2), direction: 'west'},
          ]
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
