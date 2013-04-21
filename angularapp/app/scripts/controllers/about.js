'use strict';

angular.module('angularappApp')
  .controller('AboutCtrl', function ($scope, flash) {
    // setInterval(function(){flash.info("info message");}, 1000);
    flash.info("info message");
    flash.info("info message");

    $scope.test = function(){
        flash.info("info message");
    }
  });
