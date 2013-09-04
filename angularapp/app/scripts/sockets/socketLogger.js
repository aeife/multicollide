'use strict';

angular.module('sockets')
  .directive('socketLoggerBox', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/sockets/logger.html',
      controller: function($scope, websocketApi, socket){
        $scope.events = socket.socketObj().$events;

        $scope.printToConsole = function(){
          console.log(socket.socketObj().$events);
        }

        $scope.totalListenerCount = function(){
          var count = 0;
          for (var event in socket.socketObj().$events){
            if (socket.socketObj().$events[event] && socket.socketObj().$events[event].length === 0){
              // length 0 equals 1
              count++;
            } else if (socket.socketObj().$events[event]) {
              count += socket.socketObj().$events[event].length;
            }
          }

          return count;
        }
      }
    };
  });
