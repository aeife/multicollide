'use strict';

angular.module('multicollideMock.auth', [])
  .factory('auth', function () {
    // Service logic
    // ...

    var loginStatus = false;

    // Public API here
    return {
      changeLoginStatus: function(status){
        loginStatus = status;
      },
      isLoggedIn: function() {
        return loginStatus;
      }
    };
  });
