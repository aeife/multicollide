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
      },
      move: function(){
        console.log("move");

        // delete tail
        level.grid[this.fields[0].x][this.fields[0].y].player = false;
        level.drawTile(this.fields[0].x, this.fields[0].y, 'white');
        this.fields.shift();

        // add head
        switch (this.direction){
          case "north":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y-1;
            if (level.isInGrid(newX, newY)){
              this.fields.push({x: newX, y: newY});
            }
            else
              this.fields.push({x: newX, y: level.gridSize-1});
            break;
          case "east":
            var newX = this.fields[this.fields.length-1].x+1;
            var newY = this.fields[this.fields.length-1].y;
            if (level.isInGrid(newX, newY))
              this.fields.push({x: newX, y: newY});
            else
              this.fields.push({x: 0, y: newY});
            break;
          case "south":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y+1;
            if (level.isInGrid(newX, newY))
              this.fields.push({x: newX, y: newY});
            else
              this.fields.push({x: newX, y: 0});
            break;
          case "west":
            var newX = this.fields[this.fields.length-1].x-1;
            var newY = this.fields[this.fields.length-1].y;
            if (level.isInGrid(newX, newY))
              this.fields.push({x: newX, y: newY});
            else
              this.fields.push({x: level.gridSize-1, y: newY});
            break;
        }

        level.drawTile(this.fields[this.fields.length-1].x, this.fields[this.fields.length-1].y, this.color);
      },
      changeDirection: function(dir){
        switch (dir){
          case "north":
            if (this.direction != "south")
              this.direction = dir;
            break;
          case "east":
            if (this.direction != "west")
              this.direction = dir;
            break;
          case "south":
            if (this.direction != "north")
              this.direction = dir;
            break;
          case "west":
            if (this.direction != "east")
              this.direction = dir;
            break;
        }
      }
    };

    // Public API here
    return Player;
  });


