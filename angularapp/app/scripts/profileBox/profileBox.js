'use strict';

angular.module('profileBox', [])
  .directive('profileBox', function () {
    return {
      restrict: 'E',
      templateUrl: 'scripts/profileBox/profileBox.html',
      controller: function($scope, auth, user, $dialog, lobby, $rootScope){
        $scope.lobby = lobby;
        $scope.username = $rootScope.username;

        $scope.logout = function(){
          auth.logout();
        };

        // watch for login status
        $scope.loggedIn = auth.isLoggedIn();


        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          console.log('cookies changes!');
          $scope.loggedIn = auth.isLoggedIn();
          if (newValue) {

            console.log('fetching own user data!');
            user.getUserInfo(auth.key(), function(data){
              $scope.user = data;
            });
            // user.getUserInfo(auth.key).then(function(data) {
            //   $scope.user = data;
            // });

            // get stats updates
            user.getStatsUpdate(auth.key(), function(data){
              $scope.user = data;
            }).whileLoggedIn();
          }
        }, true);

      }
    };
  });
