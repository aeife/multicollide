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
            console.log(data);
            console.log($scope.user.own);



            // check if already a friend
            if (auth.key()){
                user.getUserInfo(auth.key(), function(data){

                    if (data) {
                        console.log("CHECKING: " + $scope.user.name);
                        console.log(data.friends);
                        console.log(data.friends.indexOf($scope.user.name));
                        if (data.friends.indexOf($scope.user.name) > -1) {
                            $scope.isFriend = true;
                        } else {
                            $scope.isFriend = false;
                        }
                        console.log("RESULT");
                        console.log($scope.isFriend);
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
        user.addFriend($scope.user.name);
    }

  });
