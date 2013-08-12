'use strict';

angular.module('profile', [])
  .controller('ProfileCtrl', function ($scope, $routeParams, user, auth, $location, $rootScope, localization, socketgenapi, Paginate) {

    $scope.locale = localization.getLocalizationKeys();

    $scope.gamesPaginate = "sdf";

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
        return arr.map(function(i) {
          return {name: i};
        });
      };

      $scope.refresh = function(){
        socketgenapi.users.connected.get(function(err, data){
          $scope.users = $scope.convertUserLists(data);
          $scope.connectedUsers = data.length;
        });

        if (!this.onlyConnected){
          socketgenapi.users.all.get(function(err, data){
            $scope.users = data;
          });
        }
      };

      $scope.refresh();
    } else {
      $scope.playerlist = false;

      user.getUserInfo($routeParams.name, function(data){

        if (data) {
          console.log('setting data');

          $scope.user = data;
          // bring games in correct time order: newest first
          $scope.user.gamesParticipated.reverse();

          $scope.user.friends= ['Mock1', 'Mock1', 'Mock11', 'Mock1', 'Mock1', 'Mock12', 'Mock1', 'Mock13', 'Mock1', 'Mock1', 'Mock1', 'Mock15', 'Mock1', 'Mock1', 'Mock16', 'Mock1', 'Mock1', 'Mock17', 'Mock1', 'Mock19'];

          $scope.gamesPaginate = new Paginate($scope.user.gamesParticipated, 2);
          $scope.friendsPaginate = new Paginate($scope.user.friends, 5);

          socketgenapi.onlinestatus.on(data.name, function(data){
            console.log(data);
            $scope.user.online = data.online;
          }).forRoute();

          user.getStatsUpdate(data.name, function(data){
            var online = $scope.user.online;
            console.log(data);
            $scope.user = data;
            $scope.user.online = online;
          }).forRoute();

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

                // register listener when friend is added (his request is accepted) while visiting his profile
                socketgenapi.friend.new.on(function(data){
                  console.log(data);
                  if (data.user === $scope.user.name){
                    $scope.isFriend = data.online;
                  }
                }).forRoute();

                // register listener when friend is deleted
                socketgenapi.friend.deleted.on(function(data){
                  console.log(data);
                  if (data.user === $scope.user.name){
                    $scope.isFriend = false;
                  }
                }).forRoute();

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

    $scope.getStanding = function(user, standings){
      for (var i = 0; i < standings.length; i++){
        if (standings[i].indexOf(user) >= 0) {
          return i + 1;
        }
      }
    };

  });


