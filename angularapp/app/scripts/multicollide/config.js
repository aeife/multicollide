'use strict';

angular.module('multicollide.config', [])
  .factory('config', function ($rootScope) {
    // Service logic

    // Public API here
    return {
      gridSize: {width: 50, height: 30}
    };
  });
