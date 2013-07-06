'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketResource, socketApi) {
    // Service logic
    // ...

    // var socketGames = socketResource('/games', {param: 'test'});

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
      newLobby: function(callback){
        console.log('adding new lobby');
        socketApi.newLobby(function(data){
          // console.log('finished');
          $rootScope.$apply(callback(data));
        });
      },
      joinLobby: function(id, callback){
        console.log('joining lobby');
        socketApi.joinLobby(id, function(err, data){
          $rootScope.$apply(callback(err, data));
        });
      },
      leaveLobby: function(id, callback){
        console.log('leaving lobby');
        socketApi.leaveLobby(id, function(data){
          $rootScope.$apply(callback(data));
        });
      },
      onPlayerJoined: function(callback){
        socketApi.listenLobbyPlayerJoined(function(data){
          $rootScope.$apply(callback(data));
        });
      },
      onPlayerLeft: function(callback){
        socketApi.listenLobbyPlayerLeft(function(data){
          $rootScope.$apply(callback(data));
        });
      },
      onLobbyDeleted: function(callback){
        socketApi.listenLobbyDeleted(function(data){
          $rootScope.$apply(callback(data));
        });
      }
    };
  });
