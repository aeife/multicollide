'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketgenapi) {
    // Service logic
    // ...

    // Public API here
    return {
      listeners: {},
      getAvailableGames: function(callback){
        socketgenapi.get.games(function(data){
          $rootScope.$apply(callback(data));
        });
      },
      newLobby: function(callback){
        console.log('adding new lobby');
        socketgenapi.get.lobby.new(function(data){
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
        var self = this;
        socketgenapi.get.lobby.leave({id: id}, function(data){

          self.listeners.onPlayerJoined.stop();
          self.listeners.onPlayerLeft.stop();
          self.listeners.onLobbyDeleted.stop();

          $rootScope.$apply(callback(data));
        });
      },
      onPlayerJoined: function(callback){
        this.listeners.onPlayerJoined = socketgenapi.on.lobby.player.joined(function(data){
          callback(data);
        });
      },
      onPlayerLeft: function(callback){
        this.listeners.onPlayerLeft = socketgenapi.on.lobby.player.left(function(data){
          callback(data);
        });
      },
      onLobbyDeleted: function(callback){
        var self = this;
        this.listeners.onLobbyDeleted = socketgenapi.on.lobby.deleted(function(data){
          self.listeners.onPlayerJoined.stop();
          self.listeners.onPlayerLeft.stop();

          // once alternative
          // can't use once with parent function because whole processor object needs to be saved to listeners to stop in later
          self.listeners.onLobbyDeleted.stop();

          callback(data);
        });
      }
    };
  });
