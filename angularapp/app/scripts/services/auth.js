'use strict';

angular.module('angularappApp')
  .factory('auth', function ($http, $cookies, user, socketResource, $rootScope) {
    // Service logic
    // ...

    var socketLogin = socketResource('/login/', {param: "test"});
    var socketLogout = socketResource('/logout/', {param: "test"});

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      },
      signup: function (username, password, callback) {
        console.log("signing up");
        user.newUser(username, password, function(data){
          callback(data);
        });
      },
      login: function (username, password) {
        /* REST API*/
        // $http.post('/login', {username: username, password: password})
        // .success(function (data){
        //   $cookies.username = username;
        //   $cookies.loggedin = "true";
        // });

        /* SOCKET API*/
        socketLogin.post({username: username, password: password}, function (data) {
          console.log(data);
          if (data.loggedin) {
            $rootScope.$apply(function() {
              $cookies.username = username;
              $cookies.loggedin = "true";
            });
            
          }
        });
      },
      logout: function () {
        /* REST API */
        $http.post('http://localhost:3000/logout');

        /* SOCKET API */
        // socketLogout.post({}, function () {});


        delete $cookies.loggedin;
        delete $cookies.username;
      },
      isLoggedIn: function() {
        return $cookies.loggedin
      },
      key: function(){
        return $cookies.username;
      }
    };
  });