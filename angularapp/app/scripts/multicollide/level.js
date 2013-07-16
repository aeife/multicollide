'use strict';

angular.module('multicollide.level', [])
  .factory('level', function ($rootScope) {
    // Service logic


    // Public API here
    return {
      canvas: null,
      ctx: null,
      wrapper: null,
      gridSize: {width: 50, height: 30},
      canvasSize: null,
      tileSize: null,
      grid: [],
      setAutoResize: function(){
        var self = this;
        $(window).resize(function(e) {
          if (self.wrapper.width() !== self.canvasSize.width) {
            self.resize();
          }
        });
      },
      init: function(obj){
        this.canvas = obj.canvas;
        this.ctx = obj.ctx;
        this.wrapper = obj.wrapper;

        this.setAutoResize();
        this.resize();

        this.initializeGrid();
      },
      resize: function(){
        this.canvasSize = {width: this.wrapper.width(), height: this.wrapper.width() * (this.gridSize.height / this.gridSize.width)};
        this.tileSize = (1 / this.gridSize.width) * this.canvasSize.width;

        this.canvas.attr('width', this.canvasSize.width ); //max width
        this.canvas.attr('height', this.canvasSize.height ); //max height

        this.redraw();
      },
      redraw: function(){
        this.drawGrid();
      },
      drawTile: function(x, y, color){
        // draw rects as squares and fill whole canvas
        this.ctx.fillStyle = color;
        this.ctx.fillRect((1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);

        this.ctx.strokeStyle = "#F2F2F2";
        this.ctx.strokeRect((1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
      },
      drawImageTile: function(x, y, image, rotation){
        // console.log("rotation: " + rotation);
        if (rotation){
          this.ctx.save();
          this.ctx.translate((1 / this.gridSize.width) * this.canvasSize.width * x + this.tileSize/2, (1 / this.gridSize.height) * this.canvasSize.height * y + this.tileSize/2);
          this.ctx.rotate(rotation * Math.PI / 180);
          this.ctx.translate(-(1 / this.gridSize.width) * this.canvasSize.width * x -this.tileSize/2, -(1 / this.gridSize.height) * this.canvasSize.height * y-this.tileSize/2);
          this.ctx.drawImage(image, (1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
          this.ctx.restore();
        } else {
          this.ctx.drawImage(image, (1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
        }
      },
      drawGrid: function(){
        for (var i = 0; i < this.gridSize.width; i++){
          for (var j = 0; j < this.gridSize.height; j++){
            this.drawTile(i, j, 'white');
          }
        }
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
        this.drawTile(x, y, 'black');
      }
    };
  });
