'use strict';



module.exports = {
  hooks: {
    removeLobbyAfter: undefined
  },
  listen: function(io, socketApp){
    var self = this;

    var STATES = require('../app/states.js')();

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
      socketApp.lobbies[lobbyHighestCount] = {
        id: lobbyHighestCount,
        name: (data.name) ? data.name  : 'new game ' + lobbyHighestCount,
        host: data.host,
        status: data.status,
        players: [],
        maxplayers: data.maxplayers
      };

      return socketApp.lobbies[lobbyHighestCount];
    }

    /**
     * remove a lobby from the collection
     * @param  {int} id Id of the corresponding lobby
     */
    function removeLobby(id){
      console.log('REMOVING LOBBY');
      // for each user connected: delete reference to username and leave socket room
      console.log(socketApp.lobbyForUsername);
      for (var i = 0; i < socketApp.lobbies[id].players.length; i++){
        var player = socketApp.lobbies[id].players[i];
        delete socketApp.lobbyForUsername[player];

        socketApp.clients[socketApp.getIdForUsername(player)].leave(socketApp.lobbies[id].name);

        console.log(player + ' leaves room ' + socketApp.lobbies[id].name);
      }

      console.log(socketApp.lobbyForUsername);

      delete socketApp.lobbies[id];

      // remove turn interval for lobby if currently started
      if (self.hooks.removeLobbyAfter){
        self.hooks.removeLobbyAfter(id);
      }
    }

    /**
     * user joins lobby
     * @param  {int} id Id of corresponding lobby
     * @param  {object} socket Socket object of the joining user
     */
    function joinLobby(id, socket){
      if (!socketApp.lobbies[id].players){
        socketApp.lobbies[id].players = [];
      }
      socketApp.lobbies[id].players.push(socket.session.username);
      // socketApp.lobbies[id].players++;
      socketApp.lobbyForUsername[socket.session.username] = id;

      //join socket room and send join event to other players in lobby
      //io.sockets.in(socketApp.lobbies[id].name).emit('lobby:player:joined', {username: socket.session.username});
      socket.join(socketApp.lobbies[id].name);


      // send user info when joining
      socketApp.User.findOne({name: socket.session.username}, function(err, user){
        if (user) {
          var userObj = user.toObject();
          socket.broadcast.to(socketApp.lobbies[id].name).emit('lobby:player:joined', socketApp.removeSensibleData(userObj));
        } else {
          // user is guest, just send name
          socket.broadcast.to(socketApp.lobbies[id].name).emit('lobby:player:joined', {name: socket.session.username});
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
      if (socketApp.lobbies[id].host === socket.session.username){
        // host left lobby, leave room with host (to not get 'host left' message) and remove lobby
        socket.leave(socketApp.lobbies[id].name);
        io.sockets.in(socketApp.lobbies[id].name).emit('lobby:leave', {reason: 'host left'});

        removeLobby(id);
      } else {

        if (socketApp.lobbies[id].players.indexOf(socket.session.username) > -1){
          socketApp.lobbies[id].players.splice(socketApp.lobbies[id].players.indexOf(socket.session.username),1);
          // socketApp.lobbies[id].players--;
        }

        delete socketApp.lobbyForUsername[socket.session.username];

        //send left event to other players in lobby and leave socket room
        socket.leave(socketApp.lobbies[id].name);
        io.sockets.in(socketApp.lobbies[id].name).emit('lobby:player:left', {username: socket.session.username});
      }
    }

    function lobbyStart(id, socket){
      // check if really host started the game
      if (socketApp.lobbies[id].host === socket.session.username){
        socketApp.lobbies[id].status = STATES.GAME.INGAME;

        // emit start to all players in lobby
        io.sockets.in(socketApp.lobbies[id].name).emit('lobby:start', {});
      }
    }




    io.sockets.on('connection', function(socket){
      socket.on('lobby:new', function(data){
        console.log('client requested games info');
        var newLobby = addLobby({name: data.lobbyName, host: socket.session.username, status: STATES.GAME.LOBBY, maxplayers: data.maxplayers});
        joinLobby(newLobby.id, socket);
        socket.emit('lobby:new', newLobby);
      });

      socket.on('lobby:join', function(data){
        console.log('client wants to join lobby');
        // checking if lobby still exists
        var err = null;
        if (socketApp.lobbies[data.id]){
          // check if max players reached
          if (socketApp.lobbies[data.id].players.length === socketApp.lobbies[data.id].maxplayers){
            err = 'lobby is full';
          } else {
            joinLobby(data.id, socket);
          }
        } else {
          err = 'lobby was deleted';
        }
        socket.emit('lobby:join', err, socketApp.lobbies[data.id]);
      });

      socket.on('lobby:leave', function(data){
        var lobbyId = socketApp.lobbyForUsername[socket.session.username];

        console.log('client wants to leave lobby');
        console.log(socket.session.username);
        leaveLobby(lobbyId, socket);
        socket.emit('lobby:leave', socketApp.lobbies[lobbyId]);
      });


      socket.on('lobby:start', function(data){
        var lobbyId = socketApp.lobbyForUsername[socket.session.username];

        console.log('host started game');
        lobbyStart(lobbyId, socket);
        // socket.emit('lobby:start', {});


        // wait a bit and then send game start
        // @TODO: something better then waiting?
        setTimeout(function(){
          io.sockets.in(socketApp.lobbies[lobbyId].name).emit('multicollide:start', {});
        }, 500);

      });

      socket.on('disconnect', function(data){
        console.log('client disconnected');

        // leave lobby if in lobby
        if (typeof socketApp.lobbyForUsername[socket.session.username] !== 'undefined'){
          leaveLobby(socketApp.lobbyForUsername[socket.session.username], socket);
        }
      });
    });


  }
}



