'use strict';



module.exports = function(io, socketApp){
  var STATES = require('../app/states.js')();

  // direction changes of player during a turnfor each lobby
  var directionChanges = {};

  function updatePlayerStatistics(player, standing, standingsCount, gameId){
    var stepLength = 100 / (standingsCount - 1);

    socketApp.User.findOne({ name: player}, function(err, user){
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
            io.sockets.emit('user:statsUpdate:'+player, socketApp.removeSensibleData(userObj));
          }
        });
      }
    });
  }

  io.sockets.on('connection', function(socket){

    socket.on('multicollide:start', function(data){
      var lobbyId = socketApp.lobbyForUsername[socket.session.username];
      // reset or initialize for start
      directionChanges[lobbyId] = [];

      socketApp.turnLoop[lobbyId] = setInterval(function(){
        io.sockets.in(socketApp.lobbies[lobbyId].name).emit('multicollide:turn', {directionChanges: directionChanges[lobbyId]});

        // reset information
        directionChanges[lobbyId] = [];
      },50);
    });

    socket.on('multicollide:changeDirection', function(data){
      var lobbyId = socketApp.lobbyForUsername[socket.session.username];

      if (!directionChanges[lobbyId]) {
        directionChanges[lobbyId] = [];
      }
      // console.log(socket.session.username + ' changed direction to ' + data.direction);
      directionChanges[lobbyId].push({player: socket.session.username, direction: data.direction});
    });

    socket.on('multicollide:end', function(data){
      var lobbyId = socketApp.lobbyForUsername[socket.session.username];
      // change lobby status
      socketApp.lobbies[lobbyId].status = STATES.GAME.LOBBY;

      // clear turn interval vor lobby
      clearInterval(socketApp.turnLoop[lobbyId]);

      // adjust player stats with new standings
      var standingsCount = data.standings.length;

      // add new game to database
      var game = new socketApp.Game({standings: data.standings});
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
      io.sockets.in(socketApp.lobbies[lobbyId].name).emit('multicollide:end', {});
    });
  });
};
