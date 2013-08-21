'use strict';

angular.module('users.userlist', [])
  .controller('UserlistCtrl', function ($scope, $routeParams, user, auth, $location, $rootScope, localization, socketgenapi, Paginate) {

    $scope.locale = localization.getLocalizationKeys();

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
  });

