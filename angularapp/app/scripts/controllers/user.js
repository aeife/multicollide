'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user, auth) {
    user.getUserInfo($routeParams.name, function(data){

        if (data) {
            console.log("setting data");
            if(!$scope.$$phase) {
                $scope.$apply(function () {
                  $scope.user = data;
                });
            } else {
                $scope.user = data;
            }

            // check if already a friend
            if (auth.key()){
                user.getUserInfo(auth.key(), function(data){

                    if (data) {
                        console.log("friends");
                        console.log(data);
                        if (data.friends.indexOf($scope.user.name) > -1) {
                            var isFriend = true;
                        } else {
                            var isFriend = false;
                        }
                        
                        $scope.isFriend = isFriend;
                        // if(!$scope.$$phase) {
                        //     $scope.$apply(function () {
                        //        $scope.isFriend = isFriend;
                        //     });
                        // } else {
                        //     $scope.isFriend = isFriend;
                        // }

                    } else {
                        redirect("/");
                    }
                });
            }
        } else {
            redirect("/");
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
