'use strict';

angular.module('login', [])
  .controller('LoginCtrl', function ($scope, auth) {
    $scope.username = '';
    $scope.password = '';
    $scope.login = function(){
      auth.login($scope.username, $scope.password);
    };
  });
