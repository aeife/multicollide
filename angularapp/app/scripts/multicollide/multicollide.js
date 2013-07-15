'use strict';

angular.module('multicollide', [])
  .controller('MulticollideCtrl', function ($scope, lobby, flash, $dialog, $location, $rootScope, $filter) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var wrapper = document.getElementById('canvasWrapper');

    $scope.gridSize = {width: 50, height: 30};

    resize();

    $(window).resize(function(e) {
      if ($('#canvasWrapper').width() !== $scope.canvasSize.width) {
        resize();
      }
    });

    function resize(){
      // resize according to grid ratio
      $scope.canvasSize = {width: $('#canvasWrapper').width(), height: $('#canvasWrapper').width() * ($scope.gridSize.height / $scope.gridSize.width)};
      $scope.tileSize = (1 / $scope.gridSize.width) * $scope.canvasSize.width;

      canvas.attr('width', $scope.canvasSize.width ); //max width
      canvas.attr('height', $scope.canvasSize.height ); //max height

      redraw();
    }

    function redraw(){
      printGrid();
    }

    function drawTile(x, y){
      // draw rects as squares and fill whole canvas
      ctx.strokeStyle = "#F2F2F2";
      ctx.strokeRect((1 / $scope.gridSize.width) * $scope.canvasSize.width * x, (1 / $scope.gridSize.height) * $scope.canvasSize.height * y, $scope.tileSize, $scope.tileSize);
    }

    function printGrid(){
      for (var i = 0; i < $scope.gridSize.width; i++){
        for (var j = 0; j < $scope.gridSize.height; j++){
          drawTile(i,j);
        }
      }
    }
  });
