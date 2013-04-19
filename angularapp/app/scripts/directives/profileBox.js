'use strict';

angular.module('angularappApp')
  .directive('profileBox', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/profileBox.html',
      controller: function($scope, $resource, $http, $rootScope, $cookies, $cookieStore, auth, user){



        /*if ($rootScope.loggedin){
          $scope.templateUrl = 'views/profileBoxUser.html';
        } else {
          $scope.templateUrl = 'views/profileBoxGuest.html';
        }*/

       // var User = $resource('http://localhost\\:3000/test');

        $scope.showProfile = function(){
          //$scope.templateUrl = 'views/profileBoxUser.html';

          // var own = user.getOwnUserInfo();
          console.log("OWN:");
          // console.log(own);
          // $scope.user = user.getOwnUserInfo();

          user.getOwnUserInfo().then(function(data) {
            $scope.user = data;
          });


          var User = $resource('http://localhost\\:3000/user/own', {});
          var ownuser = User.get({}, function() {
            console.log(ownuser);
            $scope.username = ownuser.username;
            $scope.games = ownuser.games;
          });
        }

        $scope.logout = function(){
          auth.logout();
        }

/*        if ($cookies.loggedin){
          $scope.showProfile();
        } else {
          $scope.templateUrl = 'views/profileBoxGuest.html';
        }*/

        // watch for cookie
        $scope.cookie = auth.isLoggedIn();

        
        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          console.log("cookies changes!");
          $scope.cookie = auth.isLoggedIn();
          if (newValue)  $scope.showProfile();
          //else $scope.templateUrl = 'views/profileBoxGuest.html';
        }, true);
      


        $scope.changeStatus = function(){
          console.log($scope.cookie);
          // console.log($scope.user);
          // console.log($scope.cookie);
          // console.log($cookies);
          // if ($cookies.loggedin) console.log("LOGGED IN");

          // var User1 = $resource('http://localhost\\:3000/user/own', {});
          // var user1 = User1.get({}, function() {
          //   console.log(user1);
          // });
          //console.log($cookieStore.get('ownid'));

          /*if ($rootScope.loggedin){
          $scope.templateUrl = 'views/profileBoxUser.html';
        } else {
          $scope.templateUrl = 'views/profileBoxGuest.html';
        }*/
            /*$scope.templateUrl = 'views/profileBoxUser.html';

            console.log($rootScope.loggedin);

            $http.get('http://localhost:3000/user/123').
            success(function(data, status, headers, config) {
              console.log("SUCCESS");
              console.log(data.friends);
              // this callback will be called asynchronously
              // when the response is available
            }).
            error(function(data, status, headers, config) {
              console.log("ERROR");
              console.log(data);
              console.log(status);
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });


            $http.get('http://localhost:3000/test').
            success(function(data, status, headers, config) {
              console.log(data);
            });

            var user = User.get({}, function() {
              console.log(user);
            });

            $http.post('http://localhost:3000/test', {test: "data"});*/
        };


        

       /* var User = $resource('http://localhost\\:8000/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function() {
          console.log(user);
        });*/
      }
      /*link: function postLink(scope, element, attrs) {
        element.text('this is the profileBox directive');
      }*/
    };
  });
