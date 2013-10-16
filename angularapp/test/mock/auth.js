'use strict';

angular.module('multicollideMock.auth', [])
  .factory('auth', function () {
    // Service logic
    // ...

    // Public API here
    return {
      loginStatus: false,
      isLoggedIn: function() {
        var self = this;
        return self.loginStatus;
      }
    };
  });
