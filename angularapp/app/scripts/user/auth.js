'use strict';

angular.module('user.auth', [])
  .factory('auth', function ($http, $cookies, user, websocketApi, $rootScope, $location, flash, $filter, localization) {
    // Service logic
    // ...

    // Public API here
    return {
      signup: function (userSignUp, callback) {
        console.log('signing up');
        user.newUser(userSignUp, function(data){
          callback(data);
        });
      },
      login: function (username, password) {
        websocketApi.user.login.get({username: username, password: password}, function (data) {
          console.log(data);
          if (data.loggedin) {
            $cookies.username = username;
            $cookies.loggedin = 'true';

            // @TODO: use $rootScope OR cookie for username information
            $rootScope.username = username;

            // change language to account language
            localization.changeLanguage(data.language);

            $location.path('/');
          } else {
            flash.error($filter('i18n')('_WrongLoginCredentials_'));
          }
        });
      },
      logout: function () {
        // @TODO: possible hook before logout?
        websocketApi.user.logout.get(function (data) {
          console.log("successfully logged out");
          // save new guest username
          $rootScope.username = data.username;
        });

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
