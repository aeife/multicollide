'use strict';

/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http'),
  path = require('path'),
  crypto = require('crypto'),
  secret = 'some secret',
  sessionKey = 'express.sid',
  cookieParser = express.cookieParser(secret),
  sessionStore = new express.session.MemoryStore();

var app = express();

console.log('../angularapp');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/app');
  app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.logger('dev'));
  app.use(cookieParser);
  app.use(express.session({store: sessionStore, key: sessionKey, cookie: { httpOnly: false }}));
  app.use(express.compress());
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.all('/*', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });


/**
 * Database
 */


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/multicollide');

mongoose.connection.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});
mongoose.connection.on('index',function(err) {
  console.error('MongoDB error: %s', err);
});
mongoose.set('debug', true);

var userSchema = mongoose.Schema({
  name: {type: String, index: {unique: true}},
  password: String,
  games: {type: Number, default: 0},
  won: {type: Number, default: 0},
  score: {type: Number, default: 0},
  friends: [String]
});
userSchema.set('autoIndex', true);
var User = mongoose.model('User', userSchema);





/*
******************************************************
********************** REST API **********************
******************************************************
*/

app.get('/', function (req, res) {
  res.render('index.html');
});

// app.get('/login', function (req, res) {
//     res.json({ha: 'ha'});
// });

app.post('/user', function(req, res){
  var user = new User({name: req.body.name, password: crypto.createHash('sha512').update(req.body.password).digest('hex')});
  user.save(function (err, user) {
    var error = null;
    if (err) {
      console.log(err);
      if (err.code === 11000) {
        console.log('DSFSDFDSF');
        error = 'duplicate name';
      }
    }
    res.json({error: error});
  });

});

app.post('/login', function(req, res){
  // console.log(req);
  // console.log(req.session);
  // console.log(req.body);      // your JSON
  console.log(req.body.username);
  console.log(req.body.password);


  User.findOne({ name: req.body.username, password: crypto.createHash('sha512').update(req.body.password).digest('hex')}, function(err, user){
    if (err) {
      console.log(err);
    }
    if (user) {
      console.log('FOUND');
      req.session.loggedin = true;
      console.log('setting session username');
      console.log(req.body.username);
      req.session.username = req.body.username;
      res.json({loggedin: true});
    } else {
      res.json({loggedin: false});
    }
  });


  // if (req.body.username === 'test' && req.body.password === 'tester'){
  //   req.session.loggedin = true;
  //   req.session.username = 'test';
  //   res.json({loggedin: true, id: 123});
  // }

});

app.post('/logout', function(req, res){
  console.log('LOGOUT');

  req.session.destroy();

  //response.send(request.body);    // echo the result back
});


app.get('/user/:name', function (req, res) {
  console.log('GETTING USER');

  console.log(req.params.name);

  User.findOne({ name: req.params.name }, {password : 0}, function(err, user){
    console.log(user);
    if (user) {

      console.log(user.name);
      console.log(req.session.username);

      var userobj = user.toObject();

      //check if own user
      if (user.name === req.session.username) {
        // own user only data
        userobj.own = true;
        console.log(userobj);
      } else {
        // delete own user only data
        delete userobj.friends;
      }
      res.json(userobj);
    } else {
      res.send(404, { error: 'Something blew up!' });
    }
  });


});

app.get('/user/own', function (req, res) {

  if (req.session.loggedin){
    User.findOne({ name: req.session.username }, {password : 0}, function(err, user){
      console.log(user);
      res.json(user);
    });
  }

});


app.post('/friend', function(req, res){
  console.log(req.session.username + ' wants to add ' + req.body.name);

  User.findOne({ name: req.session.username }, {password : 0}, function(err, user){
    if (user.friends.indexOf(req.body.name) < 0){
      user.friends.push(req.body.name);
      user.save(function (err, user) {
        var error = false;
        if (err) {
          console.log(err);
          error = true;
        }
        res.json({error: error});
      });
    }
  });
});

app.delete('/friend/:name', function(req, res){
  console.log(req.body);
  console.log(req.params);
  console.log(req.session.username + ' wants to delete ' + req.params.name);

  User.findOne({ name: req.session.username }, {password : 0}, function(err, user){
    user.friends.remove(req.params.name);
    user.save(function (err, user) {
      var error = false;
      if (err) {
        console.log(err);
        error = true;
      }
      res.json({error: error});
    });
  });
});




// server
var server = http.createServer(app);
/*.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

// for grunt
exports = module.exports = server;
// delegates user() function
exports.use = function() {
  app.use.apply(app, arguments);
};



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
lobbys = {
  0: {id: 0, name: 'game nr. 1', status: 'lobby', players: 2, maxplayers: 10},
  1: {id: 1, name: 'fine game', status: 'playing', players: 9, maxplayers: 10},
  2: {id: 2, name: 'another game', status: 'lobby', players: 4, maxplayers: 10}
};
lobbyHighestCount = lobbyHighestCount  +1 +1 +1;

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
      var user = new User({name: data.name, password: crypto.createHash('sha512').update(data.password).digest('hex')});
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
          setSession('loggedIn', true, socket);
          // socket.session.username = data.username;
          // socket.session.save();

          addConnectedUser(data.username, socket);
          console.log('ID FOR USER: ' + data.username);
          console.log(getIdForUsername(data.username));
          socket.emit('/login/', {loggedin: true});
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

      socket.session.loggedin = null;
      socket.session.username = generateRandomGuestName();

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
    var newLobby = addLobby({name: 'new game', status: 'lobby', players: 1, maxplayers: 2});
    joinLobby(newLobby.id, socket);
    socket.emit('lobby:new', newLobby);
  });

  socket.on('lobby:join', function(data){
    console.log('client wants to join lobby');
    joinLobby(data.id, socket);
    socket.emit('lobby:join', lobbys[data.id]);
  });

  socket.on('lobby:leave', function(data){
    console.log('client wants to leave lobby');
    console.log(socket.session.username);
    leaveLobby(data.id, socket);
    socket.emit('lobby:leave', lobbys[data.id]);
  });

});


function generateRandomGuestName(){
  //generate random number until not already in use
  var randNr;
  do{
    randNr = Math.floor((Math.random()*900)+100);
  } while (connectedUsers.indexOf('Guest'+randNr) > -1);

  return 'Guest'+randNr;
}

/*
  handles a connecting user

  adds a user to the list of connected users
  adds the according id and username to the dictionary
  emits the event
  sends the user all pending friend requests
*/
function addConnectedUser(username, socket, wasGuest){
  // if no username, generate random and save
  if (!username){
    username = generateRandomGuestName();
    setSession('username', username, socket);
    // socket.session.username = username;
  } else if (socket.session.username.indexOf('Guest') > -1){
    // user was guest before he logged in
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


function setSession(attr, val, socket){
  socket.session[attr] = val;
  socket.session.save();
}


/*
  handles a disconnected user

  deletes a user from the list of connected users
  deletes the connected of username and id for user
  emits the event
*/
function deleteConnectedUser(username, socket){
  connectedUsers.splice(connectedUsers.indexOf(username),1);
  delete clientUsernames[username];
  socket.broadcast.emit('onlinestatus:'+username, {user: username, online: false});
}

/*
  returns the id (socket.id) for a given username
*/
function getIdForUsername(username){
  return clientUsernames[username];
}





/*
  adds a friend request for username from friend
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

/*
  emits all pending friend requests to specific user
*/
function sendFriendRequestsIfExist(username){
  if (friendRequests[username] && friendRequests[username].length > 0)
  clients[getIdForUsername(username)].emit('friend:request', {requests: friendRequests[username]});
}

/*
  removes a friend request for username from friend
*/
function removeFriendRequest(username, friend){
  if (friendRequests[username] && friendRequests[username].indexOf(friend) > -1){
    friendRequests[username].splice(friendRequests[username].indexOf(friend), 1);
  }
}





function addLobby(data){
  lobbyHighestCount++;

  // add lobby
  // add player who opened lobby as first player to lobby
  lobbys[lobbyHighestCount] = {
    id: lobbyHighestCount,
    name: data.name + lobbyHighestCount,
    status: data.status,
    players: data.players,
    maxplayers: data.maxplayers,
    currentPlayers: []
  };

  return lobbys[lobbyHighestCount];
}

function removeLobby(id){
  delete lobbys[id];
}

function joinLobby(id, socket){
  if (!lobbys[id].currentPlayers){
    lobbys[id].currentPlayers = [];
  }
  lobbys[id].currentPlayers.push(socket.session.username);
  lobbyForUsername[socket.session.username] = id;

  //send join event to other players in lobby
  //@TODO: only players in same lobby
  socket.broadcast.emit('lobby:player:joined', {username: socket.session.username});
}


function leaveLobby(id, socket){
  if (lobbys[id].currentPlayers.indexOf(socket.session.username) > -1){
    lobbys[id].currentPlayers.splice(lobbys[id].currentPlayers.indexOf(socket.session.username),1);
  }

  delete lobbyForUsername[socket.session.username];

  //send left event to other players in lobby
  //@TODO: only players in same lobby
  socket.broadcast.emit('lobby:player:left', {username: socket.session.username});
}

/*
  get Lobby in which player with given socket.id is
*/
function getLobbyOfUsername(name) {
  return lobbyForUsername[name];
}
