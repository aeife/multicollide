'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user, auth, $location) {
    user.getUserInfo($routeParams.name, function(data){

        if (data) {
            console.log("setting data");

            $scope.user = data;
            console.log("online status:");
            console.log(data.online);

            // check if already a friend
            if (auth.key()){
                user.getUserInfo(auth.key(), function(data){

                    if (data) {
                        console.log("friends");
                        console.log(data);
                        if (data.friends.indexOf($scope.user.name) > -1) {
                            $scope.isFriend = true;
                        } else {
                            $scope.isFriend = false;
                        }
                    } else {
                        $location.path("/route");
                    }
                });
            }
        } else {
            $location.path("/route");
        }
    });



    $scope.addAsFriend = function(){
        console.log("adding user " + $scope.user.name + " as friend");
        user.addFriend($scope.user.name, function(error){
            if (!error){
                $scope.isFriend = true;
            }
        });
    }

    $scope.deleteFriend = function(){
        console.log("deleting user " + $scope.user.name + " as friend");
        user.deleteFriend($scope.user.name, function(error){
            console.log(error);
            if (!error){
                $scope.isFriend = false;
            }
        });
    }

  });
