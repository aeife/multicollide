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
        socketgenapi.get.user.logout({}, function () {});


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
