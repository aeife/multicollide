'use strict';

angular.module('angularappApp')
  .directive('friendslist', function () {
    return {
      template: '<div><h1>Friends List</h1></div>',
      restrict: 'E',
      controller: function($scope, auth, user, socket){
        // get friend list
        // subscribe to online status changes for all friends
        // onlinestatus:<username>
        if (auth.key()) {
            user.getUserInfo(auth.key(), function(data){
                console.log(data.friends);

                for (var i = 0; i < data.friends.length; i++) {
                    socket.on("onlinestatus:"+data.friends[i], function(data){
                        console.log(data.friends[i] + "has changed online status!");
                    });
                }

            });
        }
      },
    };
  });
