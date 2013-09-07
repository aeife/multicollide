'use strict';

var EventEmitter = require('events').EventEmitter;

module.exports = {
  events: new EventEmitter(),
  // saves all current available self.lobbies
  lobbies: {},
  // saves current lobby for each username
  lobbyForUsername: {},
  listen: function(io){
    var self = this;

    var db = require('./database');
    var socketServer = require('./socketServer');
    var STATES = require('../app/states.js')();
    var api = socketServer.api;

    // highest current lobby id for continues counting
    var lobbyHighestCount = -1;

    /**
     * add a lobby to the collection
     * @param {object} data Attributes for new lobby
     * @return {object} object of new created lobby
     */
    function addLobby(data){
      lobbyHighestCount++;

      // add lobby
      // add player who opened lobby as first player to lobby
      self.lobbies[lobbyHighestCount] = {
        id: lobbyHighestCount,
        game: data.game,
        name: (data.name) ? data.name  : 'new game ' + lobbyHighestCount,
        host: data.host,
        status: data.status,
        players: [],
        maxplayers: data.maxplayers
      };

      return self.lobbies[lobbyHighestCount];
    }

    /**
     * remove a lobby from the collection
     * @param  {int} id Id of the corresponding lobby
     */
    function removeLobby(id, socket){
      console.log('REMOVING LOBBY');
      // for each user connected: delete reference to username and leave socket room
      console.log(self.lobbyForUsername);
      for (var i = 0; i < self.lobbies[id].players.length; i++){
        var player = self.lobbies[id].players[i];
        delete self.lobbyForUsername[player];

        socketServer.clients[socketServer.getIdForUsername(player)].leave(self.lobbies[id].name);

        // send new online status
        socketServer.updateOnlinestatus(player, {game: false}, socket);

        console.log(player + ' leaves room ' + self.lobbies[id].name);
      }

      console.log(self.lobbyForUsername);

      delete self.lobbies[id];

      // emit internal event
      self.events.emit('removeLobbyAfter', {lobbyId: id});
    }

    /**
     * user joins lobby
     * @param  {int} id Id of corresponding lobby
     * @param  {object} socket Socket object of the joining user
     */
    function joinLobby(id, socket){
      if (!self.lobbies[id].players){
        self.lobbies[id].players = [];
      }
      self.lobbies[id].players.push(socket.session.username);
      // self.lobbies[id].players++;
      self.lobbyForUsername[socket.session.username] = id;

      //join socket room and send join event to other players in lobby
      //io.sockets.in(self.lobbies[id].name).emit('lobby:player:joined', {username: socket.session.username});
      socket.join('lobby' + id);

      // send new online status
      socketServer.updateOnlinestatus(socket.session.username, {game: self.lobbies[id].game}, socket);


      // send user info when joining
      db.User.findOne({name: socket.session.username}, function(err, user){
        if (user) {
          var userObj = user.toObject();
          socket.broadcast.to('lobby' + id).emit(api.lobby.player.joined, db.removeSensibleData(userObj));
        } else {
          // user is guest, just send name
          socket.broadcast.to('lobby' + id).emit(api.lobby.player.joined, {name: socket.session.username});
        }
      });
    }

    /**
     * user left lobby
     *
     * @param  {int} id Id of the corresponding lobby
     * @param  {object} socket Socket object of the leaving user
     */
    function leaveLobby(id, socket){
      if (self.lobbies[id].host === socket.session.username){
        // host left lobby, leave room with host (to not get 'host left' message) and remove lobby
        socket.leave('lobby' + id);
        io.sockets.in('lobby' + id).emit(api.lobby.leave, {reason: 'host left'});

        // send new online status
        socketServer.updateOnlinestatus(socket.session.username, {game: false}, socket);

        removeLobby(id, socket);
      } else {

        if (self.lobbies[id].players.indexOf(socket.session.username) > -1){
          self.lobbies[id].players.splice(self.lobbies[id].players.indexOf(socket.session.username),1);
          // self.lobbies[id].players--;
        }

        delete self.lobbyForUsername[socket.session.username];

        //send left event to other players in lobby and leave socket room
        socket.leave('lobby' + id);
        io.sockets.in('lobby' + id).emit(api.lobby.player.left, {username: socket.session.username});

        // send new online status
        socketServer.updateOnlinestatus(socket.session.username, {game: false}, socket);
      }
    }

    function lobbyStart(id, socket){
      // check if really host started the game
      if (self.lobbies[id].host === socket.session.username){
        self.lobbies[id].status = STATES.GAME.INGAME;

        // emit start to all players in lobby
        io.sockets.in('lobby' + id).emit(api.lobby.start, {});
      }
    }




    io.sockets.on('connection', function(socket){
      socket.on(api.lobby.new, function(data){
        console.log('client requested games info');
        var newLobby = addLobby({game: data.game, name: data.lobbyName, host: socket.session.username, status: STATES.GAME.LOBBY, maxplayers: data.maxplayers});
        joinLobby(newLobby.id, socket);
        socket.emit(api.lobby.new, newLobby);
      });

      socket.on(api.lobby.join, function(data){
        console.log('client wants to join lobby');
        // checking if lobby still exists
        var err = null;
        if (self.lobbies[data.id]){
          // check if max players reached
          if (self.lobbies[data.id].players.length === self.lobbies[data.id].maxplayers){
            err = 'lobby is full';
          } else {
            joinLobby(data.id, socket);
          }
        } else {
          err = 'lobby was deleted';
        }
        socket.emit(api.lobby.join, err, self.lobbies[data.id]);
      });

      socket.on(api.lobby.leave, function(data){
        var lobbyId = self.lobbyForUsername[socket.session.username];

        console.log('client wants to leave lobby');
        console.log(socket.session.username);
        leaveLobby(lobbyId, socket);
        socket.emit(api.lobby.leave, self.lobbies[lobbyId]);
      });


      socket.on(api.lobby.start, function(data){
        var lobbyId = self.lobbyForUsername[socket.session.username];

        console.log('host started game');
        lobbyStart(lobbyId, socket);
        // socket.emit('lobby:start', {});

        // internal event
        self.events.emit('startLobbyAfter', {lobbyId: lobbyId});

      });

      socket.on('disconnect', function(data){
        console.log('client disconnected');

        // leave lobby if in lobby
        if (typeof self.lobbyForUsername[socket.session.username] !== 'undefined'){
          leaveLobby(self.lobbyForUsername[socket.session.username], socket);
        }
      });
    });


  }
};
