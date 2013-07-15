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
      drawTile: function(x,y){
        // draw rects as squares and fill whole canvas
        this.ctx.strokeStyle = "#F2F2F2";
        this.ctx.strokeRect((1 / this.gridSize.width) * this.canvasSize.width * x, (1 / this.gridSize.height) * this.canvasSize.height * y, this.tileSize, this.tileSize);
      },
      drawGrid: function(){
        for (var i = 0; i < this.gridSize.width; i++){
          for (var j = 0; j < this.gridSize.height; j++){
            this.drawTile(i,j);
          }
        }
      }
    };
  });
