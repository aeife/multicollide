'use strict';

angular.module('games')
  .factory('lobby', function ($rootScope, socketgenapi, flash, level, STATES, user) {
    // Service logic
    // ...

    // Public API here
    return {
      game: 'multicollide',
      listeners: {statsUpdate: {}},
      inLobby: false,
      currentLobby: null,
      playerForUsername: {},
      games: {},
      maxplayers: 10,
      status: null,
      lastStandings: null,
      changeGame: function(game){
        this.game = game;

        this.getAvailableGames();
      },
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
      savePlayerInfo: function(index){

        var self = this;
        // @TODO: better way
        user.getUserInfo(this.currentLobby.players[index], function(data){
          if (data){
            self.currentLobby.players[index] = data;

            // listen for stats updates
            self.listeners.statsUpdate[self.currentLobby.players[index].name] = socketgenapi.user.statsUpdate.on(self.currentLobby.players[index].name, function(data){
              self.currentLobby.players[index] = data;

              // adjust link to username
              self.playerForUsername[data.name] = self.currentLobby.players[index];
            });
          } else {
            // guest
            self.currentLobby.players[index] = {name: self.currentLobby.players[index]};
          }

          // link with username
          self.playerForUsername[self.currentLobby.players[index].name] = self.currentLobby.players[index];
        });
      },
      onJoinedLobby: function (data){
        var self = this;

        this.inLobby = true;
        this.status = STATES.GAME.LOBBY;
        this.currentLobby = data;

        // get infos for all players and listen for stats updates
        for (var i = 0; i < this.currentLobby.players.length; i++){
          self.savePlayerInfo(i);
        }

        console.log(this.currentLobby.players);

        this.onPlayerJoined(function(data){
          console.log(data);
          self.currentLobby.players.push(data);

          // link with username
          self.playerForUsername[data.name] = self.currentLobby.players[self.currentLobby.players.length-1];

          // listen for stat updates
          self.listeners.statsUpdate[self.currentLobby.players[self.currentLobby.players.length-1].name] = socketgenapi.user.statsUpdate.on(self.currentLobby.players[self.currentLobby.players.length-1].name, function(data){
            self.currentLobby.players[self.currentLobby.players.length-1] = data;

            // adjust link to username
            self.playerForUsername[data.name] = self.currentLobby.players[self.currentLobby.players.length-1];
          });
        });

        this.onPlayerLeft(function(data){
          for (var i = 0; i < self.currentLobby.players.length; i++){
            if (self.currentLobby.players[i].name === data.username){
              self.currentLobby.players.splice(i, 1);
              break;
            }

            // remove link
            delete self.playerForUsername[data.username];
          }

          self.listeners.statsUpdate[data.username].stop();
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
        for (var i in this.listeners.statsUpdate){
          this.listeners.statsUpdate[i].stop();
        }

        if (data && data.reason) {
          flash.error(data.reason);
        }

        this.inLobby = false;
        this.status = {};
        this.currentLobby = null;
        this.lastStandings = null;
        this.playerForUsername = {};

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
          self.lastStandings = null;
        });
      },
      startGame: function(){
        // @TODO: maybe get id from session on server?
        socketgenapi.lobby.start.get({id: this.currentLobby.id}, function(){});
      }
    };
  });
