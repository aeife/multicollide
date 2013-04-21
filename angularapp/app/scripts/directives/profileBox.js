'use strict';

angular.module('angularappApp')
  .directive('profileBox', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/profileBox.html',
      controller: function($scope, auth, user){

        $scope.logout = function(){
          auth.logout();
        }

        // watch for login status
        $scope.loggedIn = auth.isLoggedIn();

        
        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          console.log("cookies changes!");
          $scope.loggedIn = auth.isLoggedIn();
          if (newValue) {

            console.log("fetching own user data!");
            user.getUserInfo(auth.key(), function(data){
              
              /* apply is only needed with socket api, while rest api is in use it would generate a "$digest already in progress" error*/
              if(!$scope.$$phase) {
                $scope.$apply(function () {
                  $scope.user = data;
                });
              } else {
                $scope.user = data;
              }
             
            });
            // user.getUserInfo(auth.key).then(function(data) {
            //   $scope.user = data;
            // });
          }
        }, true);
      
        $scope.changeStatus = function(){
          console.log($scope.user);
        };
      }
    };
  });
