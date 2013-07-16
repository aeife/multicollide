'use strict';

angular.module('multicollide.level', [])
  .factory('level', function ($rootScope) {
    // Service logic


    // Public API here
    return {
      layer: null,
      canvas: null,
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
        this.layer = obj.layer;
        this.wrapper = obj.wrapper;

        this.setAutoResize();
        this.resize();

        this.initializeGrid();
      },
      resize: function(){
        console.log("resize");


        this.canvasSize = {width: this.wrapper.width(), height: this.wrapper.width() * (this.gridSize.height / this.gridSize.width)};
        this.tileSize = (1 / this.gridSize.width) * this.canvasSize.width;

        this.canvas.game.attr('width', this.canvasSize.width ); //max width
        this.canvas.game.attr('height', this.canvasSize.height ); //max height

        this.canvas.background.attr('width', this.canvasSize.width ); //max width
        this.canvas.background.attr('height', this.canvasSize.height ); //max height

        // console.log(this.fullscreenSet);
        // if (this.fullscreen){
        //   this.setFullscreen();
        // } else if (this.fullscreen !this.fullscreenSet){
        //   console.log("fullscreen set");
        //   this.fullscreenSet = true;
        // } else {
        //   console.log(this.fullscreenSet);
        //   console.log("RESETTING");
        //   this.wrapper.css("width", this.oldWidth);
        //   this.wrapper.css("position", "relative");
        //   this.wrapper.css("top", "");
        //   this.wrapper.css("right", "");
        // }


        // adjust wrapper div because of absolute position of canvas elements
        // this.wrapper.css("height", this.canvasSize.height + 100);

        this.redraw();
      },
      setFullscreen: function(){
        this.wrapper.css("width", "100%");
        this.wrapper.css("position", "absolute");
        this.wrapper.css("top", "0");
        this.wrapper.css("right", "50");
        this.resize();
      },
      exitFullscreen: function(){
        this.wrapper.css("width", "100%");
        this.wrapper.css("position", "relative");
        this.wrapper.css("top", "");
        this.wrapper.css("right", "");
        this.resize();
      },
      redraw: function(){
        this.drawBackground();
      },
      drawTile: function(x, y, color, ctx){
        // draw rects as squares and fill whole canvas
        ctx.fillStyle = color;
        ctx.fillRect((1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);

        ctx.strokeStyle = "#F2F2F2";
        ctx.strokeRect((1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
      },
      // @TODO: merge with drawImageTile if possible
      drawImage: function(x, y, image, scale){
        this.layer.background.drawImage(image, (scale / this.gridSize.width) * this.canvasSize.width * x, (scale / this.gridSize.height) * this.canvasSize.height * y, scale * this.tileSize, scale * this.tileSize);
      },
      drawImageTile: function(x, y, image, rotation){
        // console.log("rotation: " + rotation);
        if (rotation){
          this.layer.game.save();
          this.layer.game.translate((1 / this.gridSize.width) * this.canvasSize.width * x + this.tileSize/2, (1 / this.gridSize.height) * this.canvasSize.height * y + this.tileSize/2);
          this.layer.game.rotate(rotation * Math.PI / 180);
          this.layer.game.translate(-(1 / this.gridSize.width) * this.canvasSize.width * x -this.tileSize/2, -(1 / this.gridSize.height) * this.canvasSize.height * y-this.tileSize/2);
          this.layer.game.drawImage(image, (1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
          this.layer.game.restore();
        } else {
          this.layer.game.drawImage(image, (1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
        }
      },
      drawBackground: function(){
        // scale of background
        // bg-tile = 4 normal tiles
        var scale = 2;

        var imageObj = new Image();
        imageObj.src = 'images/bg.png';

        var self = this;
        imageObj.onload = function(){
          for (var i = 0; i < self.gridSize.width; i++){
            for (var j = 0; j < self.gridSize.height; j++){
              // self.drawImage(i, j, imageObj, scale);
              self.drawTile(i, j, 'white', self.layer.background);
            }
          }
        };
      },
      clearTile: function(x, y, ctx){
        ctx.clearRect((1 / this.gridSize.width) * this.canvasSize.width * x -1, (1 / this.gridSize.height) * this.canvasSize.height * y -1, this.tileSize +2, this.tileSize +2);
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
