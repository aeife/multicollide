'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user) {
    user.getUserInfo($routeParams.name, function(data){
        if (data) {
            $scope.user = data;
        } else {
            redirect("/");
        }
    });
  });
