'use strict';

module.exports.startServer = function(server, cookieParser, sessionStore,sessionKey){

  var crypto = require('crypto');

  // database
  var User = require('./database').User;

  // names of current connected users
  var connectedUsers = [];

  // sockets for all connected clients ordered with socket ids
  var clients = {};

  // saves ids for usernames
  var clientUsernames = {};

  // saves friend requests for all names ordered with username
  var friendRequests = {};

  // saves all current available lobbys
  var lobbys = {};
  // highest current lobby id for continues counting
  var lobbyHighestCount = -1;

  // mock data
  // lobbys = {
  //   0: {id: 0, name: 'game nr. 1', status: 'lobby', players: [], maxplayers: 10},
  //   1: {id: 1, name: 'fine game', status: 'playing', players: [], maxplayers: 10},
  //   2: {id: 2, name: 'another game', status: 'lobby', players: [], maxplayers: 10}
  // };
  // lobbyHighestCount = lobbyHighestCount  +1 +1 +1;

  // saves current lobby for each username
  var lobbyForUsername = {};

  // socket.io listens on server
  var io = require('socket.io').listen(server);

  /*
  ******************************************************
  ********************* Socket API *********************
  ******************************************************
  */

  /*
    set authorization for sockets
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


  /*
    user connected
  */
  io.sockets.on('connection', function(socket){
    socket.session = socket.handshake.session;
    console.log(socket.session);


    // save sockets for all clients ordered with socket id
    clients[socket.id] = socket;
    console.log('client connected as ' + socket.session.usernamey);
    // console.log(socket.session.username);

    // if user is already logged in: add to connected user list
    // if (socket.session.username && connectedUsers.indexOf(socket.session.username) === -1){
    // if (socket.session.username && socket.session.loggedin && connectedUsers.indexOf(socket.session.username) === -1){
    if (connectedUsers.indexOf(socket.session.username) === -1){
      addConnectedUser(socket.session.username, socket);
    }
    // else {
    //   socket.session.username = 'Guest';
    // }

    // send success message with username
    // @TODO: Sessions for Guest or delete on exit?
    socket.emit('successfullConnected', {username: socket.session.username});

    /*
      get user profile or sign up a new account
      (REST notation)
    */
    socket.on('/user/', function(data){
      switch(data.type){
        // get /user/:name -> profile
      case 'get':
        // console.log(socket.session.username);
        console.log(socket.session);

        User.findOne({ name: data.name }, {password : 0}, function(err, user){
          console.log(user);
          if (user) {
            var userobj = user.toObject();

            //check if own user
            if (user.name === socket.session.username) {
              // own user only data
              userobj.own = true;
            } else {
              // delete own user only data
              delete userobj.friends;
            }

            //check if currently online
            if (connectedUsers.indexOf(user.name) > -1) {
              userobj.online = true;
            }

            socket.emit('/user/'+data.name, userobj);
          } else {
            socket.emit('/user/'+data.name);
          }

        });
        break;

      // post /user/ -> sign up
      case 'post':
        var user = new User({name: data.username, password: crypto.createHash('sha512').update(data.password).digest('hex'), email: data.email});
        user.save(function (err, user) {
          var error = null;
          if (err) {
            console.log(err);
            if (err.code === 11000) {
              error = 'duplicate name';
            }
          }
          socket.emit('/user/', {error: error});
        });
        break;
      }
    });

    /*
      get all users
    */
    socket.on('users:all', function(data){
      console.log('GETTIN ALL USERS');
      User.find({}, {name : 1, _id : 0}, function(err, users){
        console.log(users);
        socket.emit('users:all', err, users);
      });
      // socket.emit('users:connected', {users: connectedUsers});
    });

    /*
      get connected users
    */
    socket.on('users:connected', function(data){
      var err = null;
      socket.emit('users:connected', err, connectedUsers);
    });


    /*
      user logs in
      (REST notation)
    */
    socket.on('/login/', function(data){
      switch(data.type){
      case 'post':
        User.findOne({ name: data.username, password: crypto.createHash('sha512').update(data.password).digest('hex')}, function(err, user){
          if (err) {
            console.log(err);
          }
          if (user) {
            // socket.session.loggedin = true;
            setSession('loggedin', true, socket);
            // socket.session.username = data.username;
            // socket.session.save();

            addConnectedUser(data.username, socket);
            console.log('ID FOR USER: ' + data.username);
            console.log(getIdForUsername(data.username));
            socket.emit('/login/', {loggedin: true, language: user.language});
          } else {
            socket.emit('/login/', {loggedin: false});
          }
        });
      }
    });

    /*
      user logs out
      (REST notation)
    */
    socket.on('/logout/', function(data){
      switch(data.type){
      case 'post':
        console.log('LOGGING USER OUT');

        // delete user from connected user list
        if (connectedUsers.indexOf(socket.session.username) > -1){
          deleteConnectedUser(socket.session.username, socket);
        }

        console.log(socket.session);
        console.log(socket.session.username);
        socket.session.destroy();
        console.log(socket.handshake.sessionID);
        sessionStore.destroy(socket.handshake.sessionID);

        // @TODO: do not delete and add connected user on logout, just change name and status
        socket.session.loggedin = null;
        socket.session.username = generateRandomGuestName();
        addConnectedUser(socket.session.username, socket);

        // console.log(socket.session);
        // console.log(socket.session.username);
        // req.session.destroy = true;
      }
    });


    /*
      user adds or removes a friend
      (REST notation)
    */
    socket.on('/friend/', function(data){
      switch(data.type){
      case 'post':
        // post /friend/ -> add friend
        console.log(socket.session.username + ' wants to add ' + data.name);

        // clients[getIdForUsername(data.name)].emit('friend:request', {from: socket.session.username});
        addFriendRequest(data.name, socket.session.username);

        // User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
        //   if (user.friends.indexOf(data.name) < 0){
        //     user.friends.push(data.name);
        //     user.save(function (err, user) {
        //       var error = false;
        //       if (err) {
        //         console.log(err);
        //         error = true;
        //       }
        //       socket.emit('/friend/', {error: error});

        //       // emit new friend and his status
        //       if (!error) {
        //         var online = false;
        //         if (connectedUsers.indexOf(data.name) > -1){
        //           online = true;
        //         }
        //         socket.emit('friend:new', {user: data.name, online: online});
        //       }
        //     });
        //   }
        // });
        break;
      case 'remove':
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
            socket.emit('/friend/'+data.name, {error: error});

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
            clients[getIdForUsername(data.name)].emit('/friend/'+socket.session.username, {error: error});

            // emit deleted friend
            clients[getIdForUsername(data.name)].emit('friend:deleted', {user: socket.session.username});
          });
        });
        break;
      }

    });

    /*
      user accepted friend request
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
            socket.emit('/friend/', {error: error});

            // emit new friend and his status
            if (!error) {
              var online = false;
              if (connectedUsers.indexOf(data.user) > -1){
                online = true;
              }
              socket.emit('friend:new', {user: data.user, online: online});
            }
          });
        }
      });

      User.findOne({ name: data.user }, {password : 0}, function(err, user){
        if (user.friends.indexOf(socket.session.username) < 0){
          user.friends.push(socket.session.username);
          user.save(function (err, user) {
            var error = false;
            if (err) {
              console.log(err);
              error = true;
            }
            clients[getIdForUsername(data.user)].emit('/friend/', {error: error});

            // emit new friend and his status
            if (!error) {
              var online = false;
              if (connectedUsers.indexOf(socket.session.username) > -1){
                online = true;
              }
              clients[getIdForUsername(data.user)].emit('friend:new', {user: socket.session.username, online: online});
            }
          });
        }
      });

      // TODO: wait for db and check for errors first
      removeFriendRequest(socket.session.username, data.user);
    });

    /*
      user declined friend request
    */
    socket.on('friend:decline', function(data){
      console.log(socket.session.username + ' declines friend request from ' + data.user);
      removeFriendRequest(socket.session.username, data.user);
    });


    /*
      get status of all friends
    */
    socket.on('/friends/', function(data){
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
            if (connectedUsers.indexOf(user.friends[i]) > -1){
              online = true;
            }
            result[user.friends[i]] = {online: online};
          }
          console.log('EMITTING TO /FRIENDS/');
          socket.emit('/friends/', result);
        }
      });
    });


    /*
      user changed password
    */
    socket.on('/settings/changePassword', function(data){
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
                socket.emit('/settings/changePassword', {error: 'error'});
              } else {
                socket.emit('/settings/changePassword', {error: null});
              }
            });
          } else {
            socket.emit('/settings/changePassword', {error: 'wrong old password'});
          }
        });
      } else {
        socket.emit('/settings/changePassword', {error: 'only use this api when logged in'});
      }
    });

    socket.on('settings:newLanguage', function(data){
      //check if user is logged in
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


    /*
      user disconnected
    */
    socket.on('disconnect', function(data){
      console.log('client disconnected');

      // leave lobby if in lobby
      if (lobbyForUsername[socket.session.username]){
        leaveLobby(lobbyForUsername[socket.session.username], socket);
      }


      delete clients[socket.id];
      if (socket.session.username){
        // if user was logged in: delete user from connected user list
        if (connectedUsers.indexOf(socket.session.username) > -1){
          deleteConnectedUser(socket.session.username, socket);
        }
      }
    });


    socket.on('/games', function(data){
      console.log('client requested games info');
      socket.emit('/games', lobbys);
    });


    socket.on('lobby:new', function(data){
      console.log('client requested games info');
      var newLobby = addLobby({name: 'new game', host: socket.session.username, status: 'lobby', maxplayers: 10});
      joinLobby(newLobby.id, socket);
      socket.emit('lobby:new', newLobby);
    });

    socket.on('lobby:join', function(data){
      console.log('client wants to join lobby');
      // checking if lobby still exists
      var err = null;
      if (lobbys[data.id]){
        joinLobby(data.id, socket);
      } else {
        err = 'lobby was deleted';
      }
      socket.emit('lobby:join', err, lobbys[data.id]);
    });

    socket.on('lobby:leave', function(data){
      console.log('client wants to leave lobby');
      console.log(socket.session.username);
      leaveLobby(data.id, socket);
      socket.emit('lobby:leave', lobbys[data.id]);
    });

  });

  /**
   * helper function to generate a random guest name
   *
   * guest name = "Guest" + random number between 100 and 999
   * @return {string} random guest name
   */
  function generateRandomGuestName(){
    //generate random number until not already in use
    var randNr;
    do{
      randNr = Math.floor((Math.random()*900)+100);
    } while (connectedUsers.indexOf('Guest'+randNr) > -1);

    return 'Guest'+randNr;
  }

  /**
   * handles a connecting user
   *
   * adds a user to the list of connected users
   * adds the according id and username to the dictionary
   * emits the event
   * sends the user all pending friend requests
   * @param {string} username Name of user
   * @param {object} socket Socket object of user
   */
  function addConnectedUser(username, socket){
    // if no username, generate random and save
    if (!username){
      username = generateRandomGuestName();
      setSession('username', username, socket);
      // socket.session.username = username;
    } else if (socket.session.username.indexOf('Guest') > -1 && connectedUsers.indexOf(socket.session.username) > -1){
      // user was guest before he logged in (= he is already connected in as a guest)
      deleteConnectedUser(socket.session.username, socket);
      // socket.session.username = username;
      setSession('username', username, socket);
    }
    // socket.session.save();
    connectedUsers.push(username);
    clientUsernames[username] = socket.id;
    socket.broadcast.emit('onlinestatus:'+username, {user: username, online: true});

    sendFriendRequestsIfExist(username);
  }

  /**
   * helper function to set a session variable and save the session
   * @param {string} attr Variable name
   * @param {misc} val Variable value
   * @param {object} socket Socket object
   */
  function setSession(attr, val, socket){
    socket.session[attr] = val;
    socket.session.save();
  }

  /**
   * handles a disconnected user
   *
   * deletes a user from the list of connected users
   * deletes the connected of username and id for user
   * emits the event
   * @param  {string} username Name of the user
   * @param  {object} socket Socket object of the user
   */
  function deleteConnectedUser(username, socket){
    connectedUsers.splice(connectedUsers.indexOf(username),1);
    delete clientUsernames[username];
    socket.broadcast.emit('onlinestatus:'+username, {user: username, online: false});
  }

  /**
   * returns the id (socket.id) for a given username
   * @param  {string} username Name of user
   * @return {id} socket.id
   */
  function getIdForUsername(username){
    return clientUsernames[username];
  }

  /**
   * adds a friend request for username from friend
   * @param {string} username Name of the user which receives the request
   * @param {string} friend Name of the user which sent the request
   */
  function addFriendRequest(username, friend){
    // if no array for user exists: create it
    if (!friendRequests[username]) {
      friendRequests[username] = [];
    }

    // only request if not already requested (so no multiple requests are possible)
    if (friendRequests[username].indexOf(friend) === -1){
      friendRequests[username].push(friend);

      // send friend request if user is online
      if (connectedUsers.indexOf(username) > -1){
        clients[getIdForUsername(username)].emit('friend:request', {requests: friendRequests[username]});
      }
    }
  }

  /**
   * emits all pending friend requests to specific user
   * @param  {string} username Name of the user for the requests
   */
  function sendFriendRequestsIfExist(username){
    if (friendRequests[username] && friendRequests[username].length > 0){
      clients[getIdForUsername(username)].emit('friend:request', {requests: friendRequests[username]});
    }
  }

  /**
   * removes a friend request for username from friend
   * @param  {string} username Name of user which received the request
   * @param  {string} friend Name of user which sent the request
   */
  function removeFriendRequest(username, friend){
    if (friendRequests[username] && friendRequests[username].indexOf(friend) > -1){
      friendRequests[username].splice(friendRequests[username].indexOf(friend), 1);
    }
  }

  /**
   * add a lobby to the collection
   * @param {object} data Attributes for new lobby
   * @return {object} object of new created lobby
   */
  function addLobby(data){
    lobbyHighestCount++;

    // add lobby
    // add player who opened lobby as first player to lobby
    lobbys[lobbyHighestCount] = {
      id: lobbyHighestCount,
      name: data.name + lobbyHighestCount,
      host: data.host,
      status: data.status,
      players: [],
      maxplayers: data.maxplayers
    };

    return lobbys[lobbyHighestCount];
  }

  /**
   * remove a lobby from the collection
   * @param  {int} id Id of the corresponding lobby
   */
  function removeLobby(id){
    console.log('REMOVING LOBBY');
    // for each user connected: delete reference to username and leave socket room
    console.log(lobbyForUsername);
    for (var i = 0; i < lobbys[id].players.length; i++){
      var player = lobbys[id].players[i];
      delete lobbyForUsername[player];

      clients[getIdForUsername(player)].leave(lobbys[id].name);

      console.log(player + ' leaves room ' + lobbys[id].name);
    }

    console.log(lobbyForUsername);

    delete lobbys[id];
  }

  /**
   * user joins lobby
   * @param  {int} id Id of corresponding lobby
   * @param  {object} socket Socket object of the joining user
   */
  function joinLobby(id, socket){
    if (!lobbys[id].players){
      lobbys[id].players = [];
    }
    lobbys[id].players.push(socket.session.username);
    // lobbys[id].players++;
    lobbyForUsername[socket.session.username] = id;

    //join socket room and send join event to other players in lobby
    socket.join(lobbys[id].name);
    io.sockets.in(lobbys[id].name).emit('lobby:player:joined', {username: socket.session.username});
  }

  /**
   * user left lobby
   *
   * @param  {int} id Id of the corresponding lobby
   * @param  {object} socket Socket object of the leaving user
   */
  function leaveLobby(id, socket){
    if (lobbys[id].host === socket.session.username){
      // host left lobby, leave room with host (to not get 'host left' message) and remove lobby
      socket.leave(lobbys[id].name);
      io.sockets.in(lobbys[id].name).emit('lobby:deleted', {reason: 'host left'});

      removeLobby(id);
    } else {

      if (lobbys[id].players.indexOf(socket.session.username) > -1){
        lobbys[id].players.splice(lobbys[id].players.indexOf(socket.session.username),1);
        // lobbys[id].players--;
      }

      delete lobbyForUsername[socket.session.username];

      //send left event to other players in lobby and leave socket room
      socket.leave(lobbys[id].name);
      io.sockets.in(lobbys[id].name).emit('lobby:player:left', {username: socket.session.username});



    }

  }

  /**
   * get Lobby in which player with given name is
   * @param  {string} name
   * @return {int} id of lobby
   */
  function getLobbyOfUsername(name) {
    return lobbyForUsername[name];
  }
};