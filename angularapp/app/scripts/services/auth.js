'use strict';

angular.module('angularappApp')
  .factory('auth', function ($http, $cookies, user) {
    // Service logic
    // ...

    var meaningOfLife = 42;

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
        // $http.post('/signup', {username: username, password: password})
        // .success(function (err){
        //   if (err) return err;
        //   else return false;
        // })
        // .error(function (data){
        //   console.log("error");
        // });
      },
      login: function (username, password) {
        $http.post('/login', {username: username, password: password})
        .success(function (data){
          $cookies.username = username;
          $cookies.loggedin = "true";
        });
      },
      logout: function () {
        $http.post('http://localhost:3000/logout');
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