'use strict';

angular.module('chat', [])
  .directive('chat', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/chat/chat.html',
      controller: function($scope, socketgenapi){

        $scope.messages = [];
        $scope.currentMessage = '';
        $scope.inChat = false;
        var chatMessageListener;

        $scope.join = function(){
          console.log('joining');
          socketgenapi.chat.join.get(function(err, data){
            console.log("got join, now listen");
            if (!err){
              $scope.inChat = true;
              chatMessageListener = socketgenapi.chat.message.on(function(data){
                $scope.messages.push(data);
                // scroll down, wait shortly so it is already applied
                // @TODO: better way to wait for apply?
                setTimeout(function(){
                  var chatElement = document.getElementById('chat');
                  chatElement.scrollTop = chatElement.scrollHeight;
                }, 5);
              });
            }
          });
        };

        $scope.leave = function(){
          console.log('leave');
          socketgenapi.chat.leave.get(function(err, data){
            if (!err){
              $scope.inChat = false;
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
