'use strict';

angular.module('multicollide.player', [])
  .factory('Player', function ($rootScope, level, canvasRender, config) {
    // Service logic

    function Player(color, direction, imageRow){
      this.color = color;
      this.direction = direction;
      this.fields = [];
      // row in spritesheet
      this.image = {
        corner: {row: imageRow, nr: 0},
        head: {row: imageRow, nr: 1},
        linear: {row: imageRow, nr: 2},
        tail: {row: imageRow, nr: 3}
      }
      // this.image = image;
    }

    Player.prototype = {
      getHead: function(){
        return this.fields[this.fields.length-1];
      },
      getColor: function(){
        return this.color;
      },
      spawn: function(x, y){
        console.log("spawn player");

        var translate = {
          north: -90,
          east: 0,
          south: 90,
          west: 180
        }

        for (var i = 0; i < config.player.startLength; i++){
          if (i === 0) {
            var image = this.image.tail;
          } else if (i === config.player.startLength-1) {
            var image = this.image.head;
          } else {
            var image = this.image.linear;
          }

          switch (this.direction){
            case "north":
              this.fields.push({x: x, y: y-i, rotation: this.direction, image: image});
              level.grid[x][y-i].players++;
              break;
            case "east":
              this.fields.push({x: x+i, y: y, rotation: this.direction, image: image});
              level.grid[x+i][y].players++;
              break;
            case "south":
              this.fields.push({x: x, y: y+i, rotation: this.direction, image: image});
              level.grid[x][y+i].players++;
              break;
            case "west":
              this.fields.push({x: x-i, y: y, rotation: this.direction, image: image});
              level.grid[x-i][y].players++;
              break;
          }
        }

        this.draw();
      },
      draw: function(){
        console.log("draw player");
        for (var i = 0; i < this.fields.length; i++){
          // level.drawTile(this.fields[i].x, this.fields[i].y, this.color);
          // console.log(this.image.linear);
          canvasRender.drawImageTile(this.fields[i].x, this.fields[i].y, this.fields[i].image, this.fields[i].rotation);
        }
      },
      getNextPlayerFieldDirection: function(index){
        if (this.fields[index].x < this.fields[index+1].x){
          return 'east';
        } else if (this.fields[index].y < this.fields[index+1].y){
          return 'south';
        } else if (this.fields[index].x > this.fields[index+1].x){
          return 'west';
        }  else if (this.fields[index].y > this.fields[index+1].y){
          return 'north';
        }
      },
      move: function(){
        // console.log("move");

        // delete tail
        level.grid[this.fields[0].x][this.fields[0].y].players--;
        canvasRender.clearTile(this.fields[0].x, this.fields[0].y, canvasRender.layer.game)

        this.fields.shift();

        // add head
        switch (this.direction){
          case "north":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y-1;
            if (!level.isInGrid(newX, newY)) {
              newY = level.gridSize.height-1;
            }
            break;
          case "east":
            var newX = this.fields[this.fields.length-1].x+1;
            var newY = this.fields[this.fields.length-1].y;
            if (!level.isInGrid(newX, newY)) {
              newX = 0;
            }
            break;
          case "south":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y+1;
            if (!level.isInGrid(newX, newY)) {
              newY = 0;
            }
            break;
          case "west":
            var newX = this.fields[this.fields.length-1].x-1;
            var newY = this.fields[this.fields.length-1].y;
            if (!level.isInGrid(newX, newY)) {
              newX = level.gridSize.width-1;
            }
            break;
        }
        this.fields.push({x: newX, y: newY, rotation: this.direction, image: this.image.head});
        level.grid[newX][newY].players++;
      },
      changeDirection: function(dir){
        // @TODO: dont allow multiple direction changes during one tick
        var head = this.fields[this.fields.length-1];
        switch (dir){
          case "north":
            if (this.direction != "south" && this.direction != "north") {
              if (this.direction === "west"){
                head.rotation = -90;
              } else if (this.direction === "east") {
                head.rotation = 180;
              }
              head.image = this.image.corner;
              canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

              this.direction = dir;
            }
            break;
          case "east":
            if (this.direction != "west" && this.direction != "east") {
              if (this.direction === "north"){
                head.rotation = 0;
              } else if (this.direction === "south") {
                head.rotation = -90;
              }
              head.image = this.image.corner;
              canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

              this.direction = dir;
            }
            break;
          case "south":
            if (this.direction != "north" && this.direction != "south") {
              if (this.direction === "west"){
                head.rotation = 0;
              } else if (this.direction === "east") {
                head.rotation = 90;
              }
              head.image = this.image.corner;
              canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

              this.direction = dir;
            }
            break;
          case "west":
            if (this.direction != "east" && this.direction != "west") {
              if (this.direction === "north"){
                head.rotation = 90;
              } else if (this.direction === "south") {
                head.rotation = 180;
              }
              head.image = this.image.corner;
              canvasRender.drawImageTile(head.x, head.y, this.image.corner, head.rotation);

              this.direction = dir;
            }
            break;
        }
      },
      kill: function(){
        var self = this;

        level.deletePlayer(this);

        // @TODO: change kill animation to support other players moving to the tiles
        this.blink(function(){
          self.remove();
        });
      },
      blink: function(callback){
        for (var i = 0; i < this.fields.length; i++){
          var times = 3;
          var duration = 200;
          var self = this;
          canvasRender.blinkImageTile(this.fields[i].x, this.fields[i].y, this.fields[i].image, this.fields[i].rotation, times, duration, function(){
            callback();
          });
        }
      },
      remove: function(){
        // delete displayed player
        for (var i = 0; i < this.fields.length; i++){
          canvasRender.clearTile(this.fields[i].x, this.fields[i].y, canvasRender.layer.game);
        }
      }
    };

    // Public API here
    return Player;
  });


