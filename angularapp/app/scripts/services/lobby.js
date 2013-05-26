'use strict';

angular.module('angularappApp')
  .factory('lobby', function ($rootScope, socketResource) {
    // Service logic
    // ...

    var meaningOfLife = 42;
    var socketGames = socketResource('/games', {param: "test"});

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      },
      getAvailableGames: function(callback){
        console.log("service requests");
        socketGames.post({}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      }
    };
  });
