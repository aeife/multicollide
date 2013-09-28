'use strict';

angular.module('users.userlist', [])
  .controller('UserlistCtrl', function ($scope, $routeParams, user, auth, $location, $rootScope, localization, websocketApi, Paginate) {

    $scope.locale = localization.getLocalizationKeys();

    $scope.onlyConnected = false;
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
      if (!this.onlyConnected){
        websocketApi.users.all.get(function(err, data){
          $scope.users = data;
          $scope.usersPaginate = new Paginate($scope.users, 12);
        });
      } else {
        websocketApi.users.connected.get(function(err, data){
          $scope.users = $scope.convertUserLists(data);
          $scope.connectedUsers = data.length;
          $scope.usersPaginate = new Paginate($scope.users, 12);
        });
      }
    };

    // refresh on option change
    $scope.$watch('onlyConnected', function(){
      $scope.refresh();
    });

    $scope.refresh();
  });


