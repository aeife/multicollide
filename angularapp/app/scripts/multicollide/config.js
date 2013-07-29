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
        solo: function(){
          return [
            {x: 1, y: Math.floor(config.gridSize.height/2), direction: 'east'},
            {x: config.gridSize.width - 2, y: Math.floor(config.gridSize.height/2), direction: 'west'},
            {x: Math.floor(config.gridSize.width/2), y: 1, direction: 'south'},
            {x: Math.floor(config.gridSize.width/2), y: config.gridSize.height - 1, direction: 'north'}
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
