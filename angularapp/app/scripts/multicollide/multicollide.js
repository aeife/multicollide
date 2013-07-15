'use strict';

angular.module('multicollide', ['multicollide.level'])
  .controller('MulticollideCtrl', function ($scope, lobby, flash, $dialog, $location, $rootScope, $filter, level) {
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var wrapper = $('#canvasWrapper');

    level.init({canvas: canvas, ctx: ctx, wrapper: wrapper});
  });
