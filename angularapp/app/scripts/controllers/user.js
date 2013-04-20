'use strict';

angular.module('angularappApp')
  .controller('UserCtrl', function ($scope, $routeParams, user) {
    user.getUserInfo($routeParams.name, function(data){

        if (data) {
            console.log("setting data");
            $scope.$apply(function () {
                $scope.user = data;
            });
        } else {
            redirect("/");
        }
    });
  });
