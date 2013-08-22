'use strict';



module.exports = {
  listen: function(io){
    var STATES = require('../app/states.js')();
    var db = require('./database');
    var lobby = require('./lobby');
    var api = require('./socketServer').api;

    var turnLoop = {};

    // direction changes of player during a turnfor each lobby
    var directionChanges = {};

    function updatePlayerStatistics(player, standing, standingsCount, gameId){
      var stepLength = 100 / (standingsCount - 1);

      db.User.findOne({ name: player}, function(err, user){
        if (err) {
          console.log(err);
        }
        if (user) {
          // add game id as reference
          user.gamesParticipated.push(gameId);

          // adjust player ratio
          var ratioDiff = user.ratio;
          user.ratio = ((user.ratio * user.games) + (stepLength * (standingsCount - standing))) / (user.games + 1);
          ratioDiff = user.ratio - ratioDiff;

          // add game to game count
          user.games++;

          // adjust elo
          var eloDiff = user.elo;
          user.elo = ((user.ratio * user.games) + (50 * 500)) / (user.games + 500);
          eloDiff = user.elo - eloDiff;

          // add win if user has won
          if (standing === 1) {
            user.wins++;
          }

          user.save(function(err){
            if (err) {
              console.log(err);
            } else {
              // emit stats update
              var userObj = user.toObject();
              userObj.ratioDiff = ratioDiff;
              userObj.eloDiff = eloDiff;
              io.sockets.emit(api.user.statsUpdate(player), db.removeSensibleData(userObj));
            }
          });
        }
      });
    }

     /**
     * Register internal listeners
     */
    // remove turn interval for lobby if currently started
    lobby.events.on('removeLobbyAfter', function(params){
      if (turnLoop[params.lobbyId]){
        clearInterval(turnLoop[params.lobbyId]);
      }
    });
    // start game on lobby start
    lobby.events.on('startLobbyAfter', function(params){
      // check if lobby contains this game
      if (lobby.lobbies[params.lobbyId].game === 'multicollide'){
        // wait a bit and then send game start
        // @TODO: something better then waiting?
        setTimeout(function(){
          io.sockets.in(lobby.lobbies[params.lobbyId].name).emit(api.multicollide.start, {});
        }, 500);
      }
    });

    io.sockets.on('connection', function(socket){

      socket.on(api.multicollide.start, function(data){
        var lobbyId = lobby.lobbyForUsername[socket.session.username];
        // reset or initialize for start
        directionChanges[lobbyId] = [];

        turnLoop[lobbyId] = setInterval(function(){
          io.sockets.in(lobby.lobbies[lobbyId].name).emit(api.multicollide.turn, {directionChanges: directionChanges[lobbyId]});

          // reset information
          directionChanges[lobbyId] = [];
        },50);
      });

      socket.on(api.multicollide.changeDirection, function(data){
        var lobbyId = lobby.lobbyForUsername[socket.session.username];

        if (!directionChanges[lobbyId]) {
          directionChanges[lobbyId] = [];
        }
        // console.log(socket.session.username + ' changed direction to ' + data.direction);
        directionChanges[lobbyId].push({player: socket.session.username, direction: data.direction});
      });

      socket.on(api.multicollide.end, function(data){
        var lobbyId = lobby.lobbyForUsername[socket.session.username];
        // change lobby status
        lobby.lobbies[lobbyId].status = STATES.GAME.LOBBY;

        // clear turn interval vor lobby
        clearInterval(turnLoop[lobbyId]);

        // adjust player stats with new standings
        var standingsCount = data.standings.length;

        // add new game to database
        var game = new db.Game({game: data.game, standings: data.standings});
        game.save(function (err, game) {
          if (err) {
            console.log(err);
          }
        });

        for (var i = 0; i < data.standings.length; i++){
          console.log("LOOP " + i);
          for (var j = 0; j < data.standings[i].length; j++){
            updatePlayerStatistics(data.standings[i][j], i + 1, data.standings.length, game.id);
          }
        }

        // emit game ending to all players
        io.sockets.in(lobby.lobbies[lobbyId].name).emit(api.multicollide.end, {});
      });
    });
  }
};

