'use strict';

angular.module('sockets')
  .directive('socketLoggerBox', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/sockets/logger.html',
      controller: function($scope, websocketApi, socket){
        $scope.events = socket.socketObj().$events;

        $scope.console = function(){
          console.log(socket.socketObj().$events);
        }
      }
    };
  });
