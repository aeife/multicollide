'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketResource, socketgenapi) {
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
        socketgenapi.get.games(function(data){
          $rootScope.$apply(callback(data));
        });
      },
      newLobby: function(callback){
        console.log('adding new lobby');
        socketgenapi.get.lobby.new(function(data){
          // console.log('finished');
          $rootScope.$apply(callback(data));
        });
      },
      joinLobby: function(id, callback){
        console.log('joining lobby');
        socketgenapi.get.lobby.join({id: id}, function(err, data){
          $rootScope.$apply(callback(err, data));
        });
      },
      leaveLobby: function(id, callback){
        console.log('leaving lobby');
        socketgenapi.get.lobby.leave({id: id}, function(data){

          socketgenapi.on.lobby.player.joined().removeAll();
          socketgenapi.on.lobby.player.left().removeAll();

          $rootScope.$apply(callback(data));
        });
      },
      onPlayerJoined: function(callback){
        socketgenapi.on.lobby.player.joined(function(data){
          callback(data);
        });
      },
      onPlayerLeft: function(callback){
        socketgenapi.on.lobby.player.left(function(data){
          callback(data);
        });
      },
      onLobbyDeleted: function(callback){
        socketgenapi.on.lobby.deleted(function(data){
          socketgenapi.on.lobby.player.joined().removeAll();
          socketgenapi.on.lobby.player.left().removeAll();

          callback(data);
        });
      }
    };
  });
