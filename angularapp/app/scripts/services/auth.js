'use strict';

angular.module('angularappApp')
  .factory('auth', function ($http, $cookies, user, socketResource, $rootScope, $location, flash, $filter) {
    // Service logic
    // ...

    var socketLogin = socketResource('/login/', {param: 'test'});
    var socketLogout = socketResource('/logout/', {param: 'test'});

    // Public API here
    return {
      signup: function (userSignUp, callback) {
        console.log('signing up');
        user.newUser(userSignUp, function(data){
          $rootScope.$apply(callback(data));
        });
      },
      login: function (username, password) {
        /* REST API*/
        // $http.post('/login', {username: username, password: password})
        // .success(function (data){
        //   if (data.loggedin) {
        //     $cookies.username = username;
        //     $cookies.loggedin = 'true';

        //     $location.path('/');
        //   } else {
        //     flash.error('wrong login');
        //   }
        // });

        /* SOCKET API*/
        socketLogin.post({username: username, password: password}, function (data) {
          console.log(data);
          if (data.loggedin) {
            $rootScope.$apply(function() {
              $cookies.username = username;
              $cookies.loggedin = 'true';

              $location.path('/');
            });

          } else {
            $rootScope.$apply(flash.error($filter('i18n')('_WrongLoginCredentials_')));

          }
        });
      },
      logout: function () {
        /* REST API */
        // $http.post('http://localhost:3000/logout');

        /* SOCKET API */
        socketLogout.post({}, function () {});


        delete $cookies.loggedin;
        delete $cookies.username;

        $location.path('/');
      },
      isLoggedIn: function() {
        return $cookies.loggedin;
      },
      key: function(){
        return $cookies.username;
      }
    };
  });
