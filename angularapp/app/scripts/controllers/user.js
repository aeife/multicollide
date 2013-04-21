'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user) {
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
        } else {
            redirect("/");
        }
    });
  });
