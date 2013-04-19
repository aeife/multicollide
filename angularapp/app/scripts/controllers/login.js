'use strict';

angular.module('angularappApp')
  .controller('LoginCtrl', function ($scope ,$http, $rootScope, $cookieStore, $cookies, auth) {
    $scope.username = '';
    $scope.password = '';
    $scope.login = function(){
        console.log("trying to log in");
        console.log($scope.username + " : " + $scope.password);

        /*$http.post('/login', {username: $scope.username, password: $scope.password})
        .success(function(data){
            console.log("successful send log in data")
            console.log(data);
            $cookies.loggedin = "true";
        });*/
        auth.login($scope.username, $scope.password);
    }
  });
