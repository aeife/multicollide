'use strict';

angular.module('chat', [])
  .directive('chat', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/chat/chat.html',
      controller: function($scope, socketgenapi){

        $scope.messages = [];
        $scope.currentMessage = '';
        var chatMessageListener;

        $scope.join = function(){
          console.log('joining');
          socketgenapi.chat.join.get(function(err, data){
            console.log("got join, now listen");
            if (!err){
              chatMessageListener = socketgenapi.chat.message.on(function(data){
                $scope.messages.push(data);
              });
            }
          });
        };

        $scope.leave = function(){
          console.log('leave');
          socketgenapi.chat.leave.get(function(err, data){
            if (!err){
              chatMessageListener.stop();
            }
          });
        };

        $scope.send = function(){
          console.log('sending ' + $scope.currentMessage);
          socketgenapi.chat.message.emit({message: $scope.currentMessage});
          $scope.currentMessage = '';
        };
      }
    };
  });
