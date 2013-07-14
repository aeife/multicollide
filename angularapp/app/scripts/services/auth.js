'use strict';

angular.module('angularappApp')
  .factory('auth', function ($http, $cookies, user, socketgenapi, $rootScope, $location, flash, $filter, localization) {
    // Service logic
    // ...

    // Public API here
    return {
      signup: function (userSignUp, callback) {
        console.log('signing up');
        user.newUser(userSignUp, function(data){
          $rootScope.$apply(callback(data));
        });
      },
      login: function (username, password) {
        socketgenapi.get.user.login({username: username, password: password}, function (data) {
          console.log(data);
          if (data.loggedin) {
            $rootScope.$apply(function() {
              $cookies.username = username;
              $cookies.loggedin = 'true';

              // change language to account language
              localization.changeLanguage(data.language);

              $location.path('/');
            });

          } else {
            $rootScope.$apply(flash.error($filter('i18n')('_WrongLoginCredentials_')));

          }
        });
      },
      logout: function () {
        // emit event so modules can make some things before logout
        // @TODO: is it secure that modules will be finished before logout?
        $rootScope.$emit('event:logout:before');
        socketgenapi.get.user.logout(function () {
          console.log("successfully logged out");
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
