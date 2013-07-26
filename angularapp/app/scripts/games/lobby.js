'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketgenapi, flash, level) {
    // Service logic
    // ...

    // Public API here
    return {
      listeners: {},
      inLobby: false,
      currentLobby: null,
      games: {},
      maxplayers: 10,
      status: "browser",
      getAvailableGames: function(){
        var self = this;
        socketgenapi.get.games(function(data){
          self.games = data;
        });
      },
      newLobby: function(lobbyName, maxplayers){
        var self = this;
        console.log('adding new lobby: ' + lobbyName);
        socketgenapi.get.lobby.new({lobbyName: lobbyName, maxplayers: maxplayers}, function(data){
          self.onJoinedLobby(data);
        });
      },
      joinLobby: function(id){
        // @TODO: only when lobby not full
        var self = this;

        console.log('joining lobby');
        socketgenapi.get.lobby.join({id: id}, function(err, data){
          if (err) {
            flash.error(err);
            self.getAvailableGames();
          } else {
            console.log('successfull joined lobby');
            self.onJoinedLobby(data);
          }
        });
      },
      leaveLobby: function(callback){
        console.log('leaving lobby');
        var self = this;
        socketgenapi.get.lobby.leave({id: this.currentLobby.id}, function(data){

          self.listeners.onPlayerJoined.stop();
          self.listeners.onPlayerLeft.stop();
          self.listeners.onLobbyDeleted.stop();
          self.listeners.onGameStarted.stop();

          self.onLeftLobby();
        });
      },
      onJoinedLobby: function (data){
        var self = this;

        this.inLobby = true;
        this.status = "lobby";
        this.currentLobby = data;

        this.onPlayerJoined(function(data){
          self.currentLobby.players.push(data.username);
        });

        this.onPlayerLeft(function(data){
          if (self.currentLobby.players.indexOf(data.username) > -1){
            self.currentLobby.players.splice(self.currentLobby.players.indexOf(data.username), 1);
          }
        });

        this.onLobbyDeleted(function(data){
          console.log("onLobbyDeleted Listener");
          flash.error(data.reason);
          self.onLeftLobby();
        });

        this.onGameStarted();
      },
      onLeftLobby: function(){
        this.inLobby = false;
        this.status = "browser";
        this.currentLobby = null;

        level.reset();

        this.getAvailableGames();
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

          self.listeners.onGameStarted.stop();

          level.reset();

          callback(data);
        });
      },
      onGameStarted: function(){
        var self = this;
        this.listeners.onGameStarted = socketgenapi.on.lobby.started(function(data){
          self.status = "ingame";
        });
      },
      startGame: function(){
        // @TODO: maybe get id from session on server?
        socketgenapi.get.lobby.start({id: this.currentLobby.id}, function(){});
      }
    };
  });
