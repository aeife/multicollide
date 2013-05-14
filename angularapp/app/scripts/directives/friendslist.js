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
        $scope.friends = {};
        // $scope.friends["test"] = {online:false};
        // $scope.friends["tester3"] = {online: true};
        // $scope.friends["tester9"] = {online: false};
        $scope.socketS = {};

        //incomming friend requests
        socket.on('friend:request', function(data){
            console.log(data.from + " wants to add you!");
        });



        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          if (newValue) {
            user.getFriendsStatus(function(data){
                $scope.friends = data;
                $scope.friendCount = friendsOnline($scope.friends);
                console.log($scope.friends);
            

                for (var friend in $scope.friends) {
                    console.log(friend);

                    $scope.socketS[friend] = socketSub('onlinestatus:'+friend, function(sdata){
                        console.log(sdata);
                        console.log(data.friends);
                        console.log(sdata.user + " has changed online status to: " + sdata.online);
                        $scope.friends[sdata.user].online = sdata.online;

                        $scope.friendCount = friendsOnline($scope.friends);
                    });
                    $scope.socketS[friend].start();

                    // socket.on("onlinestatus:"+friend, function(sdata){
                    //     console.log(sdata);
                    //     console.log(data.friends);
                    //     console.log(sdata.user + " has changed online status to: " + sdata.online);
                    //     $scope.friends[sdata.user].online = sdata.online;

                    //     $scope.friendCount = friendsOnline($scope.friends);
                    // });
                }

                // new friend
                socket.on("friend:new", function(sdata){
                    console.log("new friend!");
                    console.log($scope.friends);
                    console.log(sdata);
                    $scope.friends[sdata.user] = {online: sdata.online};
                    $scope.friendCount = friendsOnline($scope.friends);
                    console.log($scope.friends);
                    var friend = $scope.friends[sdata.user];

                    $scope.socketS[sdata.user] = socketSub('onlinestatus:'+sdata.user, function(sdata){
                        console.log(sdata.user + " has changed online status to: " + sdata.online);
                        $scope.friends[sdata.user].online = sdata.online;

                        $scope.friendCount = friendsOnline($scope.friends);
                    });
                    // socket.on("onlinestatus:"+sdata.user, function(sdata){
                    //     console.log(sdata.user + " has changed online status to: " + sdata.online);
                    //     $scope.friends[sdata.user].online = sdata.online;

                    //     $scope.friendCount = friendsOnline($scope.friends);
                    // });
                });

                // deleted friend
                socket.on("friend:deleted", function(sdata){
                    delete $scope.friends[sdata.user];

                    // TODO: remove Listener onlinestatus:sdata.user
                    console.log("stopping listener for " + sdata.user);
                    console.log($scope.socketS);
                    console.log($scope.socketS[sdata.user]);
                    $scope.socketS[sdata.user].stop();
                });
            });

            // user.getUserInfo(auth.key(), function(data){
            //     console.log(data.friends);

            //     for (var i = 0; i < data.friends.length; i++) {
            //         $scope.friends[data.friends[i]] = {online: false};
            //         console.log($scope.friends);
            //         console.log(i);
            //         socket.on("onlinestatus:"+data.friends[i], function(sdata){
            //             console.log(i);
            //             console.log(sdata);
            //             console.log(data.friends);
            //             console.log(sdata.user + " has changed online status to: " + sdata.online);
            //             $scope.friends[sdata.user].online = sdata.online;
            //         });
            //     }
            // });
          } else {
            $scope.friends = null;
          }
        });


        $scope.sortMe = function() {
            return function(object) {
                return object.value.online;
            }
        }
      },
    };
  });

function friendsOnline (friends) {
    var result = 0;
    for (var friend in friends){
        console.log(friend);
        if (friends[friend].online) result++;
    }

    console.log("NEW: " + result);
    return result;
}