'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketgenapi, flash, level, STATES) {
    // Service logic
    // ...

    // Public API here
    return {
      listeners: {},
      inLobby: false,
      currentLobby: null,
      games: {},
      maxplayers: 10,
      status: null,
      getAvailableGames: function(){
        var self = this;
        socketgenapi.games.get(function(data){
          self.games = data;
        });
      },
      newLobby: function(lobbyName, maxplayers){
        var self = this;
        console.log('adding new lobby: ' + lobbyName);
        socketgenapi.lobby.new.get({lobbyName: lobbyName, maxplayers: maxplayers}, function(data){
          self.onJoinedLobby(data);
        });
      },
      joinLobby: function(id){
        var self = this;

        console.log('joining lobby');
        socketgenapi.lobby.join.get({id: id}, function(err, data){
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
        socketgenapi.lobby.leave.get({}, function(data){

          // self.listeners.onPlayerJoined.stop();
          // self.listeners.onPlayerLeft.stop();
          // self.listeners.onLobbyDeleted.stop();
          // self.listeners.onGameStart.stop();

          self.onLeftLobby();
        });
      },
      onJoinedLobby: function (data){
        var self = this;

        this.inLobby = true;
        this.status = STATES.GAME.LOBBY;
        this.currentLobby = data;

        this.onPlayerJoined(function(data){
          self.currentLobby.players.push(data.username);
        });

        this.onPlayerLeft(function(data){
          if (self.currentLobby.players.indexOf(data.username) > -1){
            self.currentLobby.players.splice(self.currentLobby.players.indexOf(data.username), 1);
          }
        });

        this.listeners.onLobbyLeave = socketgenapi.lobby.leave.on(function(data){
          self.onLeftLobby(data);
        });

        this.onGameStart();
      },
      onLeftLobby: function(data){
        this.listeners.onPlayerJoined.stop();
        this.listeners.onPlayerLeft.stop();
        this.listeners.onGameStart.stop();
        this.listeners.onLobbyLeave.stop();

        if (data && data.reason) {
          flash.error(data.reason);
        }

        this.inLobby = false;
        this.status = {};
        this.currentLobby = null;

        this.getAvailableGames();
      },
      onPlayerJoined: function(callback){
        this.listeners.onPlayerJoined = socketgenapi.lobby.player.joined.on(function(data){
          callback(data);
        });
      },
      onPlayerLeft: function(callback){
        this.listeners.onPlayerLeft = socketgenapi.lobby.player.left.on(function(data){
          callback(data);
        });
      },
      onGameStart: function(){
        var self = this;
        this.listeners.onGameStart = socketgenapi.lobby.start.on(function(data){
          self.status = STATES.GAME.INGAME;
        });
      },
      startGame: function(){
        // @TODO: maybe get id from session on server?
        socketgenapi.lobby.start.get({id: this.currentLobby.id}, function(){});
      }
    };
  });
