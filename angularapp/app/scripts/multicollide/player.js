'use strict';

angular.module('multicollide.player', [])
  .factory('Player', function ($rootScope, level, canvasRender, config, STATES) {
    // Service logic

    function Player(username, color, direction, imageRow){
      this.username = username;
      this.color = color;
      this.direction = direction;
      this.fields = [];
      // row in spritesheet
      this.image = {
        corner: {row: imageRow, nr: 0},
        head: {row: imageRow, nr: 1},
        linear: {row: imageRow, nr: 2},
        tail: {row: imageRow, nr: 3}
      };
      // this.image = image;
    }

    Player.prototype = {
      getHead: function(){
        return this.fields[this.fields.length-1];
      },
      getColor: function(){
        return this.color;
      },
      spawn: function(x, y, direction){
        console.log('spawn player');

        this.direction = direction;

        for (var i = 0; i < config.player.startLength; i++){
          var image;
          if (i === 0) {
            image = this.image.tail;
          } else if (i === config.player.startLength-1) {
            image = this.image.head;
          } else {
            image = this.image.linear;
          }
          switch (this.direction.value){
          case STATES.MULTICOLLIDE.DIRECTION.NORTH.value:
            this.fields.push({x: x, y: y-i, rotation: this.direction, image: image});
            level.grid[x][y-i].players++;
            break;
          case STATES.MULTICOLLIDE.DIRECTION.EAST.value:
            this.fields.push({x: x+i, y: y, rotation: this.direction, image: image});
            level.grid[x+i][y].players++;
            break;
          case STATES.MULTICOLLIDE.DIRECTION.SOUTH.value:
            this.fields.push({x: x, y: y+i, rotation: this.direction, image: image});
            level.grid[x][y+i].players++;
            break;
          case STATES.MULTICOLLIDE.DIRECTION.WEST.value:
            this.fields.push({x: x-i, y: y, rotation: this.direction, image: image});
            level.grid[x-i][y].players++;
            break;
          }
        }

        this.draw();
      },
      draw: function(){
        console.log('draw player');
        for (var i = 0; i < this.fields.length; i++){
          // level.drawTile(this.fields[i].x, this.fields[i].y, this.color);
          // console.log(this.image.linear);
          canvasRender.drawImageTile(this.fields[i].x, this.fields[i].y, this.fields[i].image, this.fields[i].rotation);
        }
      },
      getNextPlayerFieldDirection: function(index){
        if (this.fields[index].x < this.fields[index+1].x){
          return STATES.MULTICOLLIDE.DIRECTION.EAST;
        } else if (this.fields[index].y < this.fields[index+1].y){
          return STATES.MULTICOLLIDE.DIRECTION.SOUTH;
        } else if (this.fields[index].x > this.fields[index+1].x){
          return STATES.MULTICOLLIDE.DIRECTION.WEST;
        }  else if (this.fields[index].y > this.fields[index+1].y){
          return STATES.MULTICOLLIDE.DIRECTION.NORTH;
        }
      },
      move: function(){
        // console.log('move');

        // delete tail
        level.grid[this.fields[0].x][this.fields[0].y].players--;
        canvasRender.clearTile(this.fields[0].x, this.fields[0].y, canvasRender.layer.game);

        this.fields.shift();

        // add head
        var newX;
        var newY;
        switch (this.direction.value){
        case STATES.MULTICOLLIDE.DIRECTION.NORTH.value:
          newX = this.fields[this.fields.length-1].x;
          newY = this.fields[this.fields.length-1].y-1;
          if (!level.isInGrid(newX, newY)) {
            newY = level.gridSize.height-1;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.EAST.value:
          newX = this.fields[this.fields.length-1].x+1;
          newY = this.fields[this.fields.length-1].y;
          if (!level.isInGrid(newX, newY)) {
            newX = 0;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.SOUTH.value:
          newX = this.fields[this.fields.length-1].x;
          newY = this.fields[this.fields.length-1].y+1;
          if (!level.isInGrid(newX, newY)) {
            newY = 0;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.WEST.value:
          newX = this.fields[this.fields.length-1].x-1;
          newY = this.fields[this.fields.length-1].y;
          if (!level.isInGrid(newX, newY)) {
            newX = level.gridSize.width-1;
          }
          break;
        }
        this.fields.push({x: newX, y: newY, rotation: this.direction, image: this.image.head});
        level.grid[newX][newY].players++;

        // replace image of old head
        // check if corner because corners are displayed before
        if (this.fields[this.fields.length-2].image !== this.image.corner){
          this.fields[this.fields.length-2].image = this.image.linear;
        }
      },
      changeDirection: function(dir){
        // @TODO: dont allow multiple direction changes during one tick
        var head = this.fields[this.fields.length-1];
        switch (dir.value){
        case STATES.MULTICOLLIDE.DIRECTION.NORTH.value:
          if (this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.SOUTH.value && this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.NORTH.value) {
            if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.WEST.value){
              head.rotation = -90;
            } else if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.EAST.value) {
              head.rotation = 180;
            }
            head.image = this.image.corner;
            canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

            this.direction = dir;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.EAST.value:
          if (this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.WEST.value && this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.EAST.value) {
            if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.NORTH.value){
              head.rotation = 0;
            } else if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.SOUTH.value) {
              head.rotation = -90;
            }
            head.image = this.image.corner;
            canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

            this.direction = dir;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.SOUTH.value:
          if (this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.NORTH.value && this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.SOUTH.value) {
            if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.WEST.value){
              head.rotation = 0;
            } else if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.EAST.value) {
              head.rotation = 90;
            }
            head.image = this.image.corner;
            canvasRender.drawImageTile(head.x, head.y, head.image, head.rotation);

            this.direction = dir;
          }
          break;
        case STATES.MULTICOLLIDE.DIRECTION.WEST.value:
          if (this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.EAST.value && this.direction.value !== STATES.MULTICOLLIDE.DIRECTION.WEST.value) {
            if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.NORTH.value){
              head.rotation = 90;
            } else if (this.direction.value === STATES.MULTICOLLIDE.DIRECTION.SOUTH.value) {
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
          canvasRender.blinkImageTile(this.fields[i].x, this.fields[i].y, this.fields[i].image, this.fields[i].rotation, times, duration, callback);
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


