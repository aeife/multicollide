'use strict';

angular.module('friendslist', [])
  .controller('FriendslistCtrl', function($scope, auth, user, localization, websocketApi){
    // get friend list
    // subscribe to online status changes for all friends
    // onlinestatus:<username>

    // get locale keys for pluralize
    $scope.locale = localization.getLocalizationKeys();

    // list of friends
    $scope.friends = {};
    $scope.friendsOnlineCount = {};

    // list of socket objects for each friend
    $scope.socketS = {};

    // list of friend requests
    $scope.requests = [];




    // TODO: change to when server accepts login, otherwise server session may not be ready
    $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
      if (newValue) {

        //get friend requests
        websocketApi.friend.request.on(function(data){
          console.log(data);
          $scope.requests = data.requests;
          // console.log(data.from + ' wants to add you!');
        }).whileLoggedIn();

        // on log in: get friends and there online status
        user.getFriendsStatus(function(data){
          $scope.friends = data;
          $scope.friendCount = Object.keys($scope.friends).length;
          $scope.friendsOnlineCount = $scope.friendsOnline($scope.friends);

          // open a socket handler for each friend
          for (var friend in $scope.friends) {
            console.log(friend);

            $scope.socketS[friend] = websocketApi.onlinestatus.on(friend, function(sdata){
              console.log(sdata.user + ' has changed online status to: ' + sdata.online);
              $scope.friends[sdata.user].online = sdata.online;
              $scope.friends[sdata.user].game = sdata.game;

              $scope.friendsOnlineCount = $scope.friendsOnline($scope.friends);
            });

          }

          // new friend (= own or other user accepted friend request)
          websocketApi.friend.new.on(function(sdata){
            // if accepted from own user delete according request
            if ($scope.requests && $scope.requests.indexOf(sdata.user) > -1){
              $scope.requests.splice($scope.requests.indexOf(sdata.user), 1);
            }

            // add friend to list, adjust friend count and add socket handler
            $scope.friends[sdata.user] = {online: sdata.online};
            $scope.friendCount = Object.keys($scope.friends).length;
            $scope.friendsOnlineCount = $scope.friendsOnline($scope.friends);
            console.log($scope.friends);
            // var friend = $scope.friends[sdata.user];

            $scope.socketS[sdata.user] = websocketApi.onlinestatus.on(sdata.user, function(sdata){
              console.log(sdata.user + ' has changed online status to: ' + sdata.online);
              $scope.friends[sdata.user].online = sdata.online;
              $scope.friends[sdata.user].game = sdata.game;

              $scope.friendsOnlineCount = $scope.friendsOnline($scope.friends);
            });

          }).whileLoggedIn();

          // deleted friend
          websocketApi.friend.deleted.on(function(sdata){
            // delete friend from list and adjust friends count
            delete $scope.friends[sdata.user];
            $scope.friendCount = Object.keys($scope.friends).length;
            $scope.friendsOnlineCount = $scope.friendsOnline($scope.friends);

            // remove Listener onlinestatus:sdata.user
            console.log('stopping listener for ' + sdata.user);
            $scope.socketS[sdata.user].stop();
          }).whileLoggedIn();
        });

      } else {
        $scope.friends = null;

        // delete listener for friends
        for (var userSocket in $scope.socketS){
          console.log('stopping listener for ' + userSocket);
          $scope.socketS[userSocket].stop();
        }
      }
    });


    // user accepted friend request
    $scope.accept = function(username){
      console.log('accepting request from ' + username);
      websocketApi.friend.accept.emit({user: username});
    };

    // user declined friend request
    $scope.decline = function(username){
      console.log('declining request from ' + username);
      websocketApi.friend.decline.emit({user: username});

      // remove request
      $scope.requests.splice($scope.requests.indexOf(username), 1);
    };

    // get count of friends with online status true
    $scope.friendsOnline = function(friends) {
      var result = 0;
      for (var friend in friends){
        if (friends[friend].online) {
          result++;
        }
      }

      return result;
    };

  })
  .directive('friendslist', function () {
    return {
      templateUrl: 'scripts/friendslist/friendslist.html',
      restrict: 'E',
      controller: 'FriendslistCtrl'
    };
  });
