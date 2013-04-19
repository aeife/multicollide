'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $http) {
    // Service logic
    // ...

    var OwnUser = $resource('http://localhost\\:3000/user/own', {});

    // Public API here
    return {
      getOwnUserInfo: function() {
        var promise = $http.get('http://localhost:3000/user/own').then(function (response) {
          // The then function here is an opportunity to modify the response
          console.log(response);
          // The return value gets picked up by the then in the controller.
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      }


    };
  });

