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
      canvas.attr('width', $scope.canvasSize.width ); //max width
      canvas.attr('height', $scope.canvasSize.height ); //max height

      redraw();
    }

    function redraw(){
      // console.log("redraw");
      // ctx.fillStyle = "red";
      // ctx.fillRect(0.1*$scope.canvasSize.width * 0, 0.1*$scope.canvasSize.width * 0, 0.1*$scope.canvasSize.width, 0.1*$scope.canvasSize.width);
      printGrid();
    }

    function drawTile(x, y){
      // draw rects as squares and fill whole canvas

      // console.log("draw tile " + x + ":" + y);
      // console.log((1 / $scope.gridSize.width) * $scope.canvasSize.width * x);
      // console.log((1 / $scope.gridSize.height) * $scope.canvasSize.height * y);


      // ctx.fillStyle = "red";
      // ctx.fillRect((1 / $scope.gridSize.width) * $scope.canvasSize.width * x, (1 / $scope.gridSize.height) * $scope.canvasSize.height * y, (1 / $scope.gridSize.width) * $scope.canvasSize.width, (1 / $scope.gridSize.height) * $scope.canvasSize.height);

      ctx.strokeStyle = "#F2F2F2";
      ctx.strokeRect((1 / $scope.gridSize.width) * $scope.canvasSize.width * x, (1 / $scope.gridSize.height) * $scope.canvasSize.height * y, (1 / $scope.gridSize.width) * $scope.canvasSize.width, (1 / $scope.gridSize.height) * $scope.canvasSize.height);
    }

    function printGrid(){
      for (var i = 0; i < $scope.gridSize.width; i++){
        for (var j = 0; j < $scope.gridSize.height; j++){
          drawTile(i,j);
        }
      }
    }
  });
