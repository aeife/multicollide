'use strict';

angular.module('chat', [])
  .directive('chat', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/chat/chat.html',
      controller: function($scope, socketgenapi, $rootScope){

        $scope.messages = [];
        $scope.currentMessage = '';
        $scope.inChat = false;
        $scope.chatUsers = [];
        var chatMessageListener;
        var chatJoinedListener;
        var chatLeftListener;

        $rootScope.$watch('username', function(){
          if ($scope.inChat){
            // just close chat, leaving is handled on server
            $scope.close();
          }
        });

        $scope.join = function(){
          console.log('joining');
          socketgenapi.chat.join.get(function(err, data){
            console.log("got join, now listen");
            if (!err){
              $scope.inChat = true;
              $scope.chatUsers = data.chatUsers;
              chatMessageListener = socketgenapi.chat.message.on(function(data){
                addMessage(data);
              });

              chatJoinedListener = socketgenapi.chat.user.joined.on(function(data){
                data.type = 'joined';
                $scope.chatUsers.push(data.username);
                addMessage(data);
              });

              chatLeftListener = socketgenapi.chat.user.left.on(function(data){
                data.type = 'left';
                $scope.chatUsers.splice($scope.chatUsers.indexOf(data.username), 1);
                addMessage(data);
              });
            }
          });
        };

        $scope.leave = function(){
          console.log('leave');
          socketgenapi.chat.leave.get(function(err, data){
            if (!err){
              $scope.close();
            }
          });
        };

        $scope.close = function(){
          $scope.inChat = false;
          $scope.messages = [];
          $scope.currentMessage = '';
          $scope.chatUsers = [];
          chatMessageListener.stop();
          chatJoinedListener.stop();
          chatLeftListener.stop();
        };

        $scope.send = function(){
          console.log('sending ' + $scope.currentMessage);
          socketgenapi.chat.message.emit({message: $scope.currentMessage});
          $scope.currentMessage = '';
        };

        function addMessage(msg){
          console.log(msg);
          console.log(msg.message);
          $scope.messages.push(msg);
          // scroll down, wait shortly so it is already applied
          // @TODO: better way to wait for apply?
          setTimeout(function(){
            var chatElement = document.getElementById('chat');
            chatElement.scrollTop = chatElement.scrollHeight;
          }, 5);
        }
      }
    };
  });
