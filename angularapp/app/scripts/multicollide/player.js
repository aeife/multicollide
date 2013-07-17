'use strict';

angular.module('multicollide.player', [])
  .factory('Player', function ($rootScope, level) {
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
      getColor: function(){
        return this.color;
      },
      spawn: function(x, y){
        console.log("spawn player");
        for (var i = 0; i < 5; i++){
          if (i === 0) {
            var image = this.image.tail;
          } else if (i === 4) {
            var image = this.image.head;
          } else {
            var image = this.image.linear;
          }
          this.fields.push({x: x + i, y: y, rotation: 0, image: image});

          level.grid[x+i][y].player = true;
        }

        this.draw();
      },
      draw: function(){
        console.log("draw player");
        for (var i = 0; i < this.fields.length; i++){
          // level.drawTile(this.fields[i].x, this.fields[i].y, this.color);
          // console.log(this.image.linear);
          level.drawImageTile(this.fields[i].x, this.fields[i].y, this.fields[i].image, this.fields[i].rotation);
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
        level.grid[this.fields[0].x][this.fields[0].y].player = false;
        level.clearTile(this.fields[0].x, this.fields[0].y, level.layer.game)
        // level.drawTile(this.fields[0].x, this.fields[0].y, 'white');
        this.fields.shift();

        // add head
        switch (this.direction){
          case "north":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y-1;
            if (level.isInGrid(newX, newY)){
              this.fields.push({x: newX, y: newY, rotation: -90, image: this.image.head});
            } else {
              this.fields.push({x: newX, y: level.gridSize.height-1, rotation: -90, image: this.image.head});
            }
            var rotation = -90;
            break;
          case "east":
            var newX = this.fields[this.fields.length-1].x+1;
            var newY = this.fields[this.fields.length-1].y;
            if (level.isInGrid(newX, newY)) {
              this.fields.push({x: newX, y: newY, rotation: 0, image: this.image.head});
            } else {
              this.fields.push({x: 0, y: newY, rotation: 0, image: this.image.head});
            }
            var rotation = 0;
            break;
          case "south":
            var newX = this.fields[this.fields.length-1].x;
            var newY = this.fields[this.fields.length-1].y+1;
            if (level.isInGrid(newX, newY)) {
              this.fields.push({x: newX, y: newY, rotation: 90, image: this.image.head});
            } else {
              this.fields.push({x: newX, y: 0, rotation: 90, image: this.image.head});
            }
            var rotation = 90;
            break;
          case "west":
            var newX = this.fields[this.fields.length-1].x-1;
            var newY = this.fields[this.fields.length-1].y;
            if (level.isInGrid(newX, newY)) {
              this.fields.push({x: newX, y: newY, rotation: 180, image: this.image.head});
            } else {
              this.fields.push({x: level.gridSize.width-1, y: newY, rotation: 180, image: this.image.head});
            }
            var rotation = 180;
            break;
        }

        var translate = {
          north: -90,
          east: 0,
          south: 90,
          west: 180
        }

        // draw new tail
        // console.log(this.fields[0].rotation);
        if (this.fields[0].image !== this.image.linear){
          this.fields[0].rotation =  translate[this.getNextPlayerFieldDirection(0)];
        }
        this.fields[0].image = this.image.tail;
        level.drawImageTile(this.fields[0].x, this.fields[0].y, this.image.tail, this.fields[0].rotation);

        // draw head
        // level.drawTile(this.fields[this.fields.length-1].x, this.fields[this.fields.length-1].y, this.color);
        level.drawImageTile(this.fields[this.fields.length-1].x, this.fields[this.fields.length-1].y, this.image.head, rotation);

        // redraw old head
        if (this.fields[this.fields.length-2].image !== this.image.corner){
          this.fields[this.fields.length-2].image = this.image.linear;
          level.drawImageTile(this.fields[this.fields.length-2].x, this.fields[this.fields.length-2].y, this.fields[this.fields.length-2].image, this.fields[this.fields.length-2].rotation);
        }

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
              level.drawImageTile(head.x, head.y, head.image, head.rotation);

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
              level.drawImageTile(head.x, head.y, head.image, head.rotation);

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
              level.drawImageTile(head.x, head.y, head.image, head.rotation);

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
              level.drawImageTile(head.x, head.y, this.image.corner, head.rotation);

              this.direction = dir;
            }
            break;
        }
      }
    };

    // Public API here
    return Player;
  });


