'use strict';

angular.module('multicollide.player', [])
  .factory('Player', function ($rootScope, level) {
    // Service logic

    function Player(color, direction){
      this.color = color;
      this.direction = direction;
      this.fields = [];
    }

    Player.prototype = {
      getColor: function(){
        return this.color;
      },
      spawn: function(x, y){
        for (var i = 0; i < 5; i++){
          this.fields.push({x: x + i, y: y});

          level.grid[x+i][y].player = true;
        }

        this.draw();
      },
      draw: function(){
        for (var i = 0; i < this.fields.length; i++){
          level.drawTile(this.fields[i].x, this.fields[i].y, this.color);
        }
      }
    };

    // Public API here
    return Player;
  });


