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
        up: 87 || 38,
        down: 83 || 40,
        left: 65 || 37,
        right: 68 || 39
      }
    };
  });
