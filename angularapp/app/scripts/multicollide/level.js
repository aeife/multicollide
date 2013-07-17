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
      spriteSheet: null,
      spriteSheetPadding: 10,
      playerTileSize: 50,
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

        this.spriteSheet = obj.spriteSheet;
      },
      resize: function(){
        console.log("resize");
        // resize canvas and tiles
        this.canvasSize = {width: this.wrapper.width(), height: this.wrapper.width() * (this.gridSize.height / this.gridSize.width)};
        this.tileSize = (1 / this.gridSize.width) * this.canvasSize.width;

        this.canvas.game.attr('width', this.canvasSize.width ); //max width
        this.canvas.game.attr('height', this.canvasSize.height ); //max height

        this.canvas.background.attr('width', this.canvasSize.width ); //max width
        this.canvas.background.attr('height', this.canvasSize.height ); //max height

        // adjust wrapper div because of absolute position of canvas elements
        this.wrapper.css("height", this.canvasSize.height + 100);

        this.redraw();
      },
      resizeHeight: function(){
        // resize canvas based on wrapper height
        // use for fullscreen view

        // height of content above canvas
        var topHeight = 100;

        // resize canvas and tiles
        this.canvasSize = {height: this.wrapper.height() - 100, width: (this.wrapper.height() - 100) * (this.gridSize.width / this.gridSize.height)};
        this.tileSize = (1 / this.gridSize.width) * this.canvasSize.width;


        this.canvas.game.attr('width', this.canvasSize.width );
        this.canvas.game.attr('height', this.canvasSize.height );

        this.canvas.background.attr('width', this.canvasSize.width );
        this.canvas.background.attr('height', this.canvasSize.height );

        // resize wrapper to canvas width and center
        this.wrapper.css("width", this.canvasSize.width+10);
        this.wrapper.css("left", window.innerWidth / 2 - (this.canvasSize.width+10)/2 + "px");

      },
      setFullscreen: function(){
        console.log("set fullscreen");
        // workaround for fullscreen with absolute positioned elements
        this.wrapper.css("height", window.innerHeight);
        this.wrapper.css("position", "absolute");
        this.wrapper.css("top", "0");
        this.resizeHeight();
      },
      exitFullscreen: function(){
        // reset settings for normal view
        this.wrapper.css("width", "100%");
        this.wrapper.css("position", "relative");
        this.wrapper.css("top", "");
        this.wrapper.css("left", "");
        this.resize();
      },
      redraw: function(){
        console.log("REDRAW");
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
          this.layer.game.drawImage(
            this.spriteSheet,                                                             // spritesheet
            image.nr * this.playerTileSize + (image.nr + 1) * this.spriteSheetPadding,    // x coordinate of tile dependend on nr in row with padding
            image.row * this.playerTileSize + (image.row + 1) * this.spriteSheetPadding,  // y coordinate of tile dependend on row with passing
            this.playerTileSize,                                                          // width of tile
            this.playerTileSize,                                                          // height size of tile
            (1 / this.gridSize.width) * this.canvasSize.width * x,                        // x coordinate to render image
            (1 / this.gridSize.height) * this.canvasSize.height * y,                      // y coordinate to render image
            this.tileSize,                                                                // width of displayed image
            this.tileSize                                                                 // height of displayed image
          );
          this.layer.game.restore();
        } else {
          this.layer.game.drawImage(
            this.spriteSheet,
            image.nr * this.playerTileSize + (image.nr + 1) * this.spriteSheetPadding,
            image.row * this.playerTileSize + (image.row + 1) * this.spriteSheetPadding,
            this.playerTileSize,
            this.playerTileSize,
            (1 / this.gridSize.width) * this.canvasSize.width * x,
            (1 / this.gridSize.height) * this.canvasSize.height * y,
            this.tileSize,
            this.tileSize
          );
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
