'use strict';

module.exports.startServer = function(server, cookieParser, sessionStore,sessionKey){



  var socketApp = {
    User: require('./database').User,
    Game: require('./database').Game,
    connectedUsers: [],
    clients: {},
    clientUsernames: {},
    lobbies: {},
    lobbyForUsername: {},
    turnLoop: {},
    directionChanges: {},
    getIdForUsername: function(username){
      return socketApp.clientUsernames[username];
    },
    removeSensibleData: function(userObj, caller){
      var user = userObj;

      if (caller && caller === user.name) {
        // if own infos dont delete some private information
        delete user.requests;
        delete user.password;
        delete user._id;
        delete user.__v;
      } else {
        delete user.requests;
        delete user.password;
        delete user._id;
        delete user.__v;
        delete user.language;
        delete user.email;
      }

      return user;
    }
  };

  // database
  var User = require('./database').User;
  var Game = require('./database').Game;

  // names of current connected users
  var connectedUsers = [];

  // sockets for all connected clients ordered with socket ids
  var clients = {};

  // saves ids for usernames
  var clientUsernames = {};

  // saves all current available socketApp.lobbies
  var lobbies = {};
  // highest current lobby id for continues counting
  var lobbyHighestCount = -1;

  // mock data
  // socketApp.lobbies = {
  //   0: {id: 0, name: 'game nr. 1', status: 'lobby', players: [], maxplayers: 10},
  //   1: {id: 1, name: 'fine game', status: 'playing', players: [], maxplayers: 10},
  //   2: {id: 2, name: 'another game', status: 'lobby', players: [], maxplayers: 10}
  // };
  // lobbyHighestCount = lobbyHighestCount  +1 +1 +1;

  // saves current lobby for each username
  var lobbyForUsername = {};

  // turn intervals for each lobby
  var turnLoop = {};

  // direction changes of player during a turnfor each lobby
  var directionChanges = {};

  // socket.io listens on server
  var io = require('socket.io').listen(server);


  var websocketApi = require('../app/websocketApi.js')();
  websocketApi = websocketApi.generateStringObject(websocketApi.api);
  // websocketApi.generateStringObject();

  var STATES = require('../app/states.js')();


// INCLUDE
var lobbyHandler = require('./lobby.js')(io, socketApp);
var userHandler = require('./user.js')(io, socketApp);
var friendHandler = require('./friend.js')(io, socketApp);


  /*
  ******************************************************
  ********************* Socket API *********************
  ******************************************************
  */

  /**
   * authorization information and settings
   */
  io.set('authorization', function(data, accept) {
    cookieParser(data, {}, function(err) {
      if (err) {
        accept(err, false);
      } else {
        console.log('SESSION KEY?');
        console.log(data.signedCookies[sessionKey]);
        data.sessionID = data.signedCookies[sessionKey];
        sessionStore.load(data.signedCookies[sessionKey], function(err, session) {
          if (err || !session) {
            accept('Session error', false);
          } else {
            // console.log('SESSION');
            // console.log(session);

            data.session = session;

            //@TODO: NOT NECESSARY??
            // data.session.id = data.signedCookies[sessionKey];
            accept(null, true);
          }
        });
      }
    });
  });

  /**
   * client connected
   * @param  {object} socket socket object for client
   */
  io.sockets.on('connection', function(socket){
    socket.session = socket.handshake.session;
    console.log(socket.session);



    // save sockets for all clients ordered with socket id
    socketApp.clients[socket.id] = socket;
    console.log('client connected as ' + socket.session.username);
    // console.log(socket.session.username);





    // else {
    //   socket.session.username = 'Guest';
    // }

    // // send success message with username
    // // @TODO: Sessions for Guest or delete on exit?
    // socket.emit('successfullConnected', {username: socket.session.username});







    /**
     * client disconnected
     */
    socket.on('disconnect', function(data){
      console.log('client disconnected');

      delete socketApp.clients[socket.id];
      // if (socket.session.username){
      //   // if user was logged in: delete user from connected user list
      //   if (socketApp.connectedUsers.indexOf(socket.session.username) > -1){
      //     deleteConnectedUser(socket.session.username, socket);
      //   }
      // }
    });


    /**
     * client requested list of open socketApp.lobbies
     */
    socket.on('games', function(data){
      console.log('client requested games info');
      socket.emit('games', socketApp.lobbies);
    });




    socket.on('multicollide:start', function(data){
      var lobbyId = socketApp.lobbyForUsername[socket.session.username];
      // reset or initialize for start
      directionChanges[lobbyId] = [];

      turnLoop[lobbyId] = setInterval(function(){
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
      clearInterval(turnLoop[lobbyId]);

      // adjust player stats with new standings
      var standingsCount = data.standings.length;

      // add new game to database
      var game = new Game({standings: data.standings});
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

  function removeSensibleData(userObj, caller){
    var user = userObj;

    if (caller && caller === user.name) {
      // if own infos dont delete some private information
      delete user.requests;
      delete user.password;
      delete user._id;
      delete user.__v;
    } else {
      delete user.requests;
      delete user.password;
      delete user._id;
      delete user.__v;
      delete user.language;
      delete user.email;
    }

    return user;
  }

  function updatePlayerStatistics(player, standing, standingsCount, gameId){
    var stepLength = 100 / (standingsCount - 1);

    User.findOne({ name: player}, function(err, user){
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
            io.sockets.emit('user:statsUpdate:'+player, removeSensibleData(userObj));
          }
        });
      }
    });
  }



  /**
   * returns the id (socket.id) for a given username
   * @param  {string} username Name of user
   * @return {id} socket.id
   */
  function getIdForUsername(username){
    return socketApp.clientUsernames[username];
  }








};
