'use strict';

angular.module('multicollide.level', [])
  .factory('level', function ($rootScope) {
    // Service logic


    // Public API here
    return {
      gridSize: {},
      grid: [],
      init: function(obj){
        this.gridSize = obj.gridSize;
        this.initializeGrid();
      },
      initializeGrid: function(){
        for (var i = 0; i < this.gridSize.width; i++) {
          this.grid[i] = [];
          for (var j = 0; j < this.gridSize.height; j++){
              this.grid[i][j] = {food: 0, player: false};
          }
        }
      },
      isInGrid: function(x, y){
        return !(x < 0 || x >= this.gridSize.width || y < 0 || y >= this.gridSize.height);
      },
      generateFood: function(x, y){
        this.grid[x][y] = {food: 5};
        // @TODO: CIRCULAR DEPENDENCY
        // canvas.drawTile(x, y, 'black');
      }
    };
  });
