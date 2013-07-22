'use strict';

angular.module('multicollide.config', [])
  .factory('config', function ($rootScope) {
    // Service logic

    // Public API here
    return {
      gridSize: {width: 50, height: 30},
      player: {
        startLength: 45
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
  });
