'use strict';

angular.module('angularappApp')
  .factory('lobby', function ($rootScope, socketResource, socketApi) {
    // Service logic
    // ...

    // var socketGames = socketResource('/games', {param: "test"});

    // Public API here
    return {
      getAvailableGames: function(callback){
        // socketGames.post({}, function(data){
        //   console.log(data);
        //   $rootScope.$apply(callback(data));
        // });
        socketApi.games(function(data){
          $rootScope.$apply(callback(data));
        });
      },
      newLobby: function(){
        console.log("adding new lobby");
        socketApi.newLobby(function(data){
          // console.log("finished");
        });
      }
    };
  });
