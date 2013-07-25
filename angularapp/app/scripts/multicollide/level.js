'use strict';

angular.module('multicollide.level', [])
  .factory('level', function ($rootScope, canvasRender) {
    // Service logic


    // Public API here
    return {
      gridSize: {},
      grid: [],
      players: [],
      init: function(obj){
        this.gridSize = obj.gridSize;
        this.initializeGrid();
      },
      initializeGrid: function(){
        for (var i = 0; i < this.gridSize.width; i++) {
          this.grid[i] = [];
          for (var j = 0; j < this.gridSize.height; j++){
              this.grid[i][j] = {food: 0, players: 0};
          }
        }
      },
      isInGrid: function(x, y){
        return !(x < 0 || x >= this.gridSize.width || y < 0 || y >= this.gridSize.height);
      },
      generateFood: function(x, y){
        this.grid[x][y] = {food: 5};
        canvasRender.drawTile(x, y, 'black', canvasRender.layer.game);
      },
      processTurn: function(){
        // moves all players

        // -------- step 1: move players --------
        this.movePlayers();

        // -------- step 2: analyse result  --------
        this.analyseMoves();

        // -------- step 3: process and draw  --------
        this.drawPlayerMoves();



      },
      movePlayers: function(){
        for (var i = 0; i < this.players.length; i++){
          this.players[i].move();
        }
      },
      analyseMoves: function(){
        // check collisions for all new player heads
        for (var i = 0; i < this.players.length; i++){
          var head = this.players[i].getHead();
          // console.log(this.grid[head.x][head.y].players);
          if (this.grid[head.x][head.y].players > 1){
            console.log("Collision");
          }
        }
      },
      drawPlayerMoves: function(){
        for (var i = 0; i < this.players.length; i++){
          var player = this.players[i];

          // draw new tail
          if (player.fields[0].image !== player.image.linear){
            player.fields[0].rotation =  player.getNextPlayerFieldDirection(0);
          }
          player.fields[0].image = player.image.tail;
          canvasRender.drawImageTile(player.fields[0].x, player.fields[0].y, player.image.tail, player.fields[0].rotation);

          // draw head
          canvasRender.drawImageTile(player.fields[player.fields.length-1].x, player.fields[player.fields.length-1].y, player.image.head, player.direction);

          // redraw old head as normal tile
          // check if corner because corners are displayed before
          if (player.fields[player.fields.length-2].image !== player.image.corner){
            player.fields[player.fields.length-2].image = player.image.linear;
            canvasRender.drawImageTile(player.fields[player.fields.length-2].x, player.fields[player.fields.length-2].y, player.fields[player.fields.length-2].image, player.fields[player.fields.length-2].rotation);
          }
        }
      },
    };
  });
