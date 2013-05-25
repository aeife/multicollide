'use strict';

angular.module('angularappApp')
  .directive('friendslist', function () {
    return {
      templateUrl: 'views/friendslist.html',
      restrict: 'E',
      controller: function($scope, auth, user, socket, socketSub){
        // get friend list
        // subscribe to online status changes for all friends
        // onlinestatus:<username>

        // list of friends
        $scope.friends = {};

        // list of socket objects for each friend
        $scope.socketS = {};

        // list of friend requests
        $scope.requests = [];

        // handle incomming friend requests
        // TODO: use generic socket service
        socket.on('friend:request', function(data){
            console.log(data);
            $scope.requests = data.requests;
            // console.log(data.from + " wants to add you!");
        });



        // TODO: change to when server accepts login, otherwise server session may not be ready
        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          if (newValue) {
            // on log in: get friends and there online status
            user.getFriendsStatus(function(data){
                $scope.friends = data;
                $scope.friendCount = friendsOnline($scope.friends);

                // open a socket handler for each friend
                for (var friend in $scope.friends) {
                    console.log(friend);

                    $scope.socketS[friend] = socketSub('onlinestatus:'+friend, function(sdata){
                        // console.log(sdata.user + " has changed online status to: " + sdata.online);
                        $scope.friends[sdata.user].online = sdata.online;

                        $scope.friendCount = friendsOnline($scope.friends);
                    });

                    // start listening for messages
                    $scope.socketS[friend].start();
                }

                // new friend (= own or other user accepted friend request)
                socket.on("friend:new", function(sdata){
                    // if accepted from own user delete according request
                    if ($scope.requests && $scope.requests.indexOf(sdata.user) > -1){
                        $scope.requests.splice($scope.requests.indexOf(sdata.user), 1);
                    }

                    // add friend to list, adjust friend count and add socket handler
                    $scope.friends[sdata.user] = {online: sdata.online};
                    $scope.friendCount = friendsOnline($scope.friends);
                    console.log($scope.friends);
                    var friend = $scope.friends[sdata.user];

                    $scope.socketS[sdata.user] = socketSub('onlinestatus:'+sdata.user, function(sdata){
                        // console.log(sdata.user + " has changed online status to: " + sdata.online);
                        $scope.friends[sdata.user].online = sdata.online;

                        $scope.friendCount = friendsOnline($scope.friends);
                    });

                    // start listening for messages
                    $scope.socketS[sdata.user].start();
                });

                // deleted friend
                socket.on("friend:deleted", function(sdata){
                    // delete friend from list and adjust friends count
                    delete $scope.friends[sdata.user];
                    $scope.friendCount = friendsOnline($scope.friends);

                    // remove Listener onlinestatus:sdata.user
                    console.log("stopping listener for " + sdata.user);
                    $scope.socketS[sdata.user].stop();
                });
            });

          } else {
            $scope.friends = null;
          }
        });


        // user accepted friend request
        $scope.accept = function(username){
            console.log("accepting request from " + username);
            socket.emit("friend:accept", {user: username});
        }

        // user declined friend request
        $scope.decline = function(username){
            console.log("declining request from " + username);
            socket.emit("friend:decline", {user: username});
            // remove request
            $scope.requests.splice($scope.requests.indexOf(username), 1);
        }

      },
    };
  });

// get count of friends with online status true
function friendsOnline (friends) {
    var result = 0;
    for (var friend in friends){
        if (friends[friend].online) result++;
    }

    return result;
}