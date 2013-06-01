'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user, auth, $location, socketSub, $rootScope, socketApi, localization) {

    $scope.locale = localization.getLocalizationKeys();

    if (!$routeParams.name){
      $scope.playerlist = true;
      $scope.onlyConnected = true;
      $scope.searchPlayer = '';
      $scope.users = [];
      $scope.connectedUsers = 0;

      $scope.clearPlayerSearch = function(){
        this.searchPlayer = '';
      };

      $scope.convertUserLists = function(arr){
        var result = [];
        for (var i = 0; i < arr.length; i++){
          result.push(arr[i].name);
        }

        return result;
      };

      $scope.refresh = function(){
        // get connected users
        socketApi.getConnectedUsers(function(err, data){
          $rootScope.$apply(function(){
            $scope.users = data;
            $scope.connectedUsers = data.length;
          });
        });

        if (!this.onlyConnected){
          socketApi.getAllUsers(function(err, data){
            $rootScope.$apply(function(){
              $scope.users = $scope.convertUserLists(data);
            });
          });
        }
      };

      $scope.refresh();
    } else {
      $scope.playerlist = false;

      user.getUserInfo($routeParams.name, function(data){

        if (data) {
          $scope.socketS = socketSub('onlinestatus:'+data.name, function(data){
            console.log(data);
            $scope.user.online = data.online;
          });

          console.log('setting data');

          $scope.user = data;
          console.log('online status:');
          console.log(data.online);
          $scope.socketS.subForRoute();

          // check if already a friend
          if (auth.key()){
            user.getUserInfo(auth.key(), function(data){

              if (data) {
                console.log('friends');
                console.log(data);
                if (data.friends.indexOf($scope.user.name) > -1) {
                  $scope.isFriend = true;
                } else {
                  $scope.isFriend = false;
                }
              } else {
                $location.path('/404');
              }
            });
          }
        } else {
          $location.path('/404');
        }
      });
    }

    $scope.addAsFriend = function(){
      console.log('adding user ' + $scope.user.name + ' as friend');
      user.addFriend($scope.user.name, function(error){
        if (!error){
          $scope.isFriend = true;
        }
      });
    };

    $scope.deleteFriend = function(){
      console.log('deleting user ' + $scope.user.name + ' as friend');
      user.deleteFriend($scope.user.name, function(error){
        console.log(error);
        if (!error){
          $scope.isFriend = false;
        }
      });
    };

  });
