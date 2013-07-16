'use strict';

angular.module('multicollide', ['multicollide.level', 'multicollide.player'])
  .controller('MulticollideCtrl', function ($scope, level, Player) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var wrapper = $('#canvasWrapper');

    level.init({canvas: canvas, ctx: ctx, wrapper: wrapper});

    var p1 = new Player('red');
    p1.spawn(1,1);
  });
