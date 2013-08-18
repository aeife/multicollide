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
    },
    addFriendRequest: function(username, friend){
      User.findOne({ name: username }, {password : 0}, function(err, user){
        console.log(user);

        // only request if not already requested (so no multiple requests are possible)
        if (user && user.requests.indexOf(friend) === -1){
          user.requests.push(friend);
          user.save(function (err) {
            if (err) {
              console.log(err);
            }

            // send friend request if user is online
            if (socketApp.connectedUsers.indexOf(username) > -1){

              socketApp.clients[getIdForUsername(username)].emit('friend:request', {requests: user.requests});
            }
          });
        }
      });
    },
    removeFriendRequest: function(username, friend){
      User.findOne({ name: username }, {password : 0}, function(err, user){

        if (user && user.requests.indexOf(friend) > -1){
          user.requests.splice(user.requests.indexOf(friend), 1);
          console.log(user);
          user.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
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
    console.log('client connected as ' + socket.session.usernamey);
    // console.log(socket.session.username);





    // else {
    //   socket.session.username = 'Guest';
    // }

    // // send success message with username
    // // @TODO: Sessions for Guest or delete on exit?
    // socket.emit('successfullConnected', {username: socket.session.username});



    /**
     * client wants to add friend
     * @param  {object} data {name}
     */
    socket.on('friend:add', function(data){
      console.log(socket.session.username + ' wants to add ' + data.name);
      addFriendRequest(data.name, socket.session.username);
    });

    /**
     * client wants to remove friend
     * @param  {object} data {name}
     */
    socket.on('friend:remove', function(data){
      // remove /friend/:name -> remove friend
      console.log(socket.session.username + ' wants to delete ' + data.name);

      // delete friend for both users
      User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
        user.friends.remove(data.name);
        user.save(function (err, user) {
          var error = false;
          if (err) {
            console.log(err);
            error = true;
          }
          socket.emit('friend:remove'+data.name, {error: error});

          // emit deleted friend
          socket.emit('friend:deleted', {user: data.name});
        });
      });

      User.findOne({ name: data.name }, {password : 0}, function(err, user){
        user.friends.remove(socket.session.username);
        user.save(function (err, user) {
          var error = false;
          if (err) {
            console.log(err);
            error = true;
          }

          // if other user is online: send deletion
          if (socketApp.clients[getIdForUsername(data.name)]) {
            socketApp.clients[getIdForUsername(data.name)].emit('/friend/'+socket.session.username, {error: error});

            // emit deleted friend
            socketApp.clients[getIdForUsername(data.name)].emit('friend:deleted', {user: socket.session.username});
          }
        });
      });
    });

    /**
     * client accepted friend request
     * @param  {object} data user
     */
    socket.on('friend:accept', function(data){
      console.log(socket.session.username + ' accepts request from ' + data.user);

      // add friend for both users
      User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
        if (user.friends.indexOf(data.user) < 0){
          user.friends.push(data.user);
          user.save(function (err, user) {
            var error = false;
            if (err) {
              console.log(err);
              error = true;
            }
            // socket.emit('/friend/', {error: error});

            // emit new friend and his status
            if (!error) {
              var online = false;
              if (socketApp.connectedUsers.indexOf(data.user) > -1){
                online = true;
              }
              socket.emit('friend:new', {user: data.user, online: online});

              // add to other user
              // @TODO: do parallel
              User.findOne({ name: data.user }, {password : 0}, function(err, user){
                if (user.friends.indexOf(socket.session.username) < 0){
                  user.friends.push(socket.session.username);
                  user.save(function (err, user) {
                    var error = false;
                    if (err) {
                      console.log(err);
                      error = true;
                    }

                    // TODO: if done parallel above: wait for db and check for errors first
                    removeFriendRequest(socket.session.username, data.user);

                    // only emit to other user when he is online
                    if (socketApp.connectedUsers.indexOf(data.user) > -1){
                      // socketApp.clients[getIdForUsername(data.user)].emit('/friend/', {error: error});

                      // emit new friend and his status
                      if (!error) {
                        var online = false;
                        if (socketApp.connectedUsers.indexOf(socket.session.username) > -1){
                          online = true;
                        }
                        socketApp.clients[getIdForUsername(data.user)].emit('friend:new', {user: socket.session.username, online: online});
                      }
                    }
                  });
                }
              });

            }
          });
        }
      });
    });

    /**
     * client declined friend request
     * @param  {object} data {user}
     */
    socket.on('friend:decline', function(data){
      console.log(socket.session.username + ' declines friend request from ' + data.user);
      removeFriendRequest(socket.session.username, data.user);
    });


    /**
     * client wants list of all friends status
     */
    socket.on('friends:all', function(data){
      console.log('GETTING FRIENDS STATUS');

      var result = {};
      //getting all friends and check their status
      User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
        if (err) {
          console.log(err);
        }

        if (user){
          console.log(user);
          for (var i = 0; i < user.friends.length; i++){
            var online = false;
            if (socketApp.connectedUsers.indexOf(user.friends[i]) > -1){
              online = true;
            }
            result[user.friends[i]] = {online: online};
          }
          console.log('EMITTING TO /FRIENDS/');
          socket.emit('friends:all', result);
        }
      });
    });

    /**
     * client wants to change his password
     * only when logged in
     *
     * @param  {object} data {name, oldPassword, newPassword}
     */
    socket.on('settings:changePassword', function(data){
      //check if user is logged in
      if (socket.session.loggedin) {
        //check if correct old password, then change
        User.findOne({ name: data.name, password: crypto.createHash('sha512').update(data.oldPassword).digest('hex')}, function(err, user){
          if (err) {
            console.log(err);
          }
          if (user) {
            console.log('updating password to: ' + data.newPassword);
            user.password = crypto.createHash('sha512').update(data.newPassword).digest('hex');
            user.save(function (err) {
              if (err) {
                socket.emit('settings:changePassword', {error: 'error'});
              } else {
                socket.emit('settings:changePassword', {error: null});
              }
            });
          } else {
            socket.emit('settings:changePassword', {error: 'wrong old password'});
          }
        });
      } else {
        socket.emit('settings:changePassword', {error: 'only use this api when logged in'});
      }
    });

    /**
     * client wants to set a new language
     * new language is saved to database if client is logged in (but should not be emitted from client anyway when not logged in)
     *
     * @param  {object} data {newLanguage}
     */
    socket.on('settings:newLanguage', function(data){
      if (socket.session.loggedin) {
        User.findOne({ name: socket.session.username}, function(err, user){
          if (err) {
            console.log(err);
          }
          if (user) {
            user.language = data.newLanguage;
            user.save(function(err){
              if (err) {
                console.log(err);
              }
            });
          }
        });
      }
    });

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

  /**
   * adds a friend request for username from friend
   * @param {string} username Name of the user which receives the request
   * @param {string} friend Name of the user which sent the request
   */
  function addFriendRequest(username, friend){
    User.findOne({ name: username }, {password : 0}, function(err, user){
      console.log(user);

      // only request if not already requested (so no multiple requests are possible)
      if (user && user.requests.indexOf(friend) === -1){
        user.requests.push(friend);
        user.save(function (err) {
          if (err) {
            console.log(err);
          }

          // send friend request if user is online
          if (socketApp.connectedUsers.indexOf(username) > -1){

            socketApp.clients[getIdForUsername(username)].emit('friend:request', {requests: user.requests});
          }
        });
      }
    });



  }



  /**
   * removes a friend request for username from friend
   * @param  {string} username Name of user which received the request
   * @param  {string} friend Name of user which sent the request
   */
  function removeFriendRequest(username, friend){
    User.findOne({ name: username }, {password : 0}, function(err, user){

      if (user && user.requests.indexOf(friend) > -1){
        user.requests.splice(user.requests.indexOf(friend), 1);
        console.log(user);
        user.save(function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }


};
