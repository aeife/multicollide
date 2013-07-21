'use strict';

angular.module('multicollide.canvasRender', [])
  .factory('canvasRender', function ($rootScope, config) {
    // Service logic

    // Public API here
    return {
      layer: null,
      canvas: null,
      wrapper: null,
      canvasSize: null,
      tileSize: null,
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
        console.log(obj);
        this.canvas = obj.canvas;
        this.layer = obj.layer;
        this.wrapper = obj.wrapper;

        this.setAutoResize();
        this.resize();

        this.spriteSheet = obj.spriteSheet;
      },
      resize: function(){
        console.log("resize");
        // resize canvas and tiles
        this.canvasSize = {width: this.wrapper.width(), height: this.wrapper.width() * (config.gridSize.height / config.gridSize.width)};
        this.tileSize = Math.floor((1 / config.gridSize.width) * this.canvasSize.width);

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
        this.canvasSize = {height: this.wrapper.height() - 100, width: (this.wrapper.height() - 100) * (config.gridSize.width / config.gridSize.height)};
        this.tileSize = (1 / config.gridSize.width) * this.canvasSize.width;


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
        ctx.fillRect(this.tileSize * x, this.tileSize * y, this.tileSize, this.tileSize);

        ctx.strokeStyle = "#F2F2F2";
        ctx.strokeRect(this.tileSize * x, this.tileSize * y, this.tileSize, this.tileSize);
      },
      // @TODO: merge with drawImageTile if possible
      drawImage: function(x, y, image, scale){
        this.layer.background.drawImage(image, (scale / config.gridSize.width) * this.canvasSize.width * x, (scale / config.gridSize.height) * this.canvasSize.height * y, scale * this.tileSize, scale * this.tileSize);
      },
      drawImageTile: function(x, y, image, rotation){
        // console.log("rotation: " + rotation);
        if (rotation){
          this.layer.game.save();
          this.layer.game.translate(this.tileSize * x + this.tileSize/2, this.tileSize * y + this.tileSize/2);
          this.layer.game.rotate(rotation * Math.PI / 180);
          this.layer.game.translate(-this.tileSize * x -this.tileSize/2, -this.tileSize * y-this.tileSize/2);
          this.layer.game.drawImage(
            this.spriteSheet,                                                             // spritesheet
            image.nr * this.playerTileSize + (image.nr + 1) * this.spriteSheetPadding,    // x coordinate of tile dependend on nr in row with padding
            image.row * this.playerTileSize + (image.row + 1) * this.spriteSheetPadding,  // y coordinate of tile dependend on row with passing
            this.playerTileSize,                                                          // width of tile
            this.playerTileSize,                                                          // height size of tile
            this.tileSize * x,                        // x coordinate to render image
            this.tileSize * y,                      // y coordinate to render image
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
            this.tileSize * x,
            this.tileSize * y,
            this.tileSize,
            this.tileSize
          );
        }
      },
      blinkImageTile: function(x, y, image, rotation, times, duration, callback){
        this.clearTile(x, y, this.layer.game);
        var self = this;

        window.setTimeout(function(){
          self.drawImageTile(x, y, image, rotation);
          if (times > 1) {
            window.setTimeout(function(){
              self.blinkImageTile(x, y, image, rotation, times-1, duration, callback);
            }, duration);
          } else {
            callback();
          }
        }, duration);

      },
      drawBackground: function(){
        // scale of background
        // bg-tile = 4 normal tiles
        var scale = 2;

        var imageObj = new Image();
        imageObj.src = 'images/bg.png';

        var self = this;
        imageObj.onload = function(){
          for (var i = 0; i < config.gridSize.width; i++){
            for (var j = 0; j < config.gridSize.height; j++){
              // self.drawImage(i, j, imageObj, scale);
              self.drawTile(i, j, 'white', self.layer.background);
            }
          }
        };
      },
      clearTile: function(x, y, ctx){
        ctx.clearRect(this.tileSize * x -1, this.tileSize * y -1, this.tileSize +2, this.tileSize +2);
      },
    };
  });
