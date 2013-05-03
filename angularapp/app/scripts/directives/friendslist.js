'use strict';

angular.module('angularappApp')
  .directive('friendslist', function () {
    return {
      templateUrl: 'views/friendslist.html',
      restrict: 'E',
      controller: function($scope, auth, user, socket){
        // get friend list
        // subscribe to online status changes for all friends
        // onlinestatus:<username>
        $scope.friends = {};
        $scope.friends["test"] = {online:false};
        $scope.friends["tester3"] = {online: true};
        $scope.friends["tester9"] = {online: false};
        // $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
        //   if (newValue) {
        //     user.getUserInfo(auth.key(), function(data){
        //         console.log(data.friends);

        //         for (var i = 0; i < data.friends.length; i++) {
        //             $scope.friends[data.friends[i]] = {online: false};
        //             console.log($scope.friends);
        //             console.log(i);
        //             socket.on("onlinestatus:"+data.friends[i], function(sdata){
        //                 console.log(i);
        //                 console.log(sdata);
        //                 console.log(data.friends);
        //                 console.log(sdata.user + " has changed online status to: " + sdata.online);
        //                 $scope.friends[sdata.user].online = sdata.online;
        //             });
        //         }
        //     });
        //   }
        // });


        $scope.sortMe = function() {
            return function(object) {
                return object.value.online;
            }
        }
      },
    };
  });
