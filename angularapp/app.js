
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , crypto = require('crypto')
  , secret = 'some secret'
  , sessionKey = 'express.sid'
  , cookieParser = express.cookieParser(secret)
  , sessionStore = new express.session.MemoryStore;

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
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });



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
})
userSchema.set('autoIndex', true);
var User = mongoose.model('User', userSchema);





// SERVER APP

app.get('/', function (req, res) {
    res.render('index.html');
});

// app.get('/login', function (req, res) {
//     res.json({ha: "ha"});
// });


// API

app.post('/user', function(req, res){
  var user = User({name: req.body.name, password: crypto.createHash('sha512').update(req.body.password).digest('hex')});
  user.save(function (err, user) {
    var error = null;
    if (err) {
      console.log(err);
      if (err.code === 11000) {
        console.log("DSFSDFDSF");
        error = "duplicate name";
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
    if (err) console.log(err);
    if (user) {
      console.log("FOUND");
      req.session.loggedin = true;
      console.log("setting session username");
      console.log(req.body.username);
      req.session.username = req.body.username;
      res.json({loggedin: true});
    } else {
      res.json({loggedin: false});
    }
  });


  // if (req.body.username === "test" && req.body.password === "tester"){
  //   req.session.loggedin = true;
  //   req.session.username = "test";
  //   res.json({loggedin: true, id: 123});
  // }

});

app.post('/logout', function(req, res){
  console.log("LOGOUT");

  req.session.destroy();  

  //response.send(request.body);    // echo the result back
});


app.get('/user/:name', function (req, res) {
  console.log("GETTING USER");

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
  console.log(req.session.username + " wants to add " + req.body.name);

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
  console.log(req.session.username + " wants to delete " + req.params.name);

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










var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


// names of current connected users
var connectedUsers = [];

// sockets for all connected clients ordered with socket ids
var clients = {};

// saves ids for usernames
var clientUsernames = {};

// saves friend requests for all names ordered with username
var friendRequests = {};

var io = require('socket.io').listen(server);

io.set('authorization', function(data, accept) {
  cookieParser(data, {}, function(err) {
    if (err) {
      accept(err, false);
    } else {
      console.log("SESSION KEY?");
      console.log(data.signedCookies[sessionKey]);
      data.sessionID = data.signedCookies[sessionKey]
      sessionStore.load(data.signedCookies[sessionKey], function(err, session) {
        if (err || !session) {
          accept('Session error', false);
        } else {
          // console.log("SESSION");
          // console.log(session);
          
          data.session = session;
          data.session.id = data.signedCookies[sessionKey];
          accept(null, true);
        }
      });
    }
  });
});


io.sockets.on('connection', function(socket){
  socket.session = socket.handshake.session;
  console.log(socket.session);

  // save sockets for all clients ordered with socket id
  clients[socket.id] = socket;
  console.log(socket.id);
  console.log("client connected");
  // console.log(socket.session.username);

  // check if already logged in and add to connected user list
  if (socket.session.username && connectedUsers.indexOf(socket.session.username) === -1){
    // console.log("adding user to list");
    addConnectedUser(socket.session.username, socket);
  }

  console.log(connectedUsers);

  socket.on('/user/', function(data){
    switch(data.type){
      // get /user/:name -> profile
      case "get":
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
      case "post":
        var user = User({name: data.name, password: crypto.createHash('sha512').update(data.password).digest('hex')});
        user.save(function (err, user) {
          var error = null;
          if (err) {
            console.log(err);
            if (err.code === 11000) {
              error = "duplicate name";
            }
          }
          socket.emit('/user/', {error: error});
        });
        break;
    }
  });

  socket.on('/login/', function(data){
    switch(data.type){
      case "post":{
        User.findOne({ name: data.username, password: crypto.createHash('sha512').update(data.password).digest('hex')}, function(err, user){
          if (err) console.log(err);
          if (user) {
            socket.session.loggedin = true;
            socket.session.username = data.username;
            socket.session.save();

            addConnectedUser(data.username, socket);
            console.log("ID FOR USER: " + data.username);
            console.log(getIdForUsername(data.username));
            socket.emit('/login/', {loggedin: true});
          } else {
            socket.emit('/login/', {loggedin: false});
          }
        });
      }
    }
  });

  socket.on('/logout/', function(data){
    switch(data.type){
      case "post":{
        console.log("LOGGING USER OUT");

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
        socket.session.username = null;



        // console.log(socket.session);
        // console.log(socket.session.username);
        // req.session.destroy = true;
      }
    }
  });


  socket.on('/friend/', function(data){
    switch(data.type){
      case "post":
        // post /friend/ -> add friend
        console.log(socket.session.username + " wants to add " + data.name);

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
      case "remove":
        // remove /friend/:name -> remove friend
        console.log(socket.session.username + " wants to delete " + data.name);

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

  socket.on('friend:accept', function(data){
    console.log(socket.session.username + " accepts request from " + data.user);

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

  socket.on('friend:decline', function(data){
    console.log(socket.session.username + " declines friend request from " + data.user);
    removeFriendRequest(socket.session.username, data.user);
  });

  socket.on('/friends/', function(data){
    console.log("GETTING FRIENDS STATUS");

    //getting status for all friends

    var result = {};
    //getting all friends
    User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
      if (err) console.log(err);
      //check status for friends
      console.log("FRIENDS");
      // console.log(user);
      console.log(user.friends);
      console.log(user.friends.length);
      if (user){
        console.log(user);
        for (var i = 0; i < user.friends.length; i++){
          var online = false;
          if (connectedUsers.indexOf(user.friends[i]) > -1){
            online = true;
          }
          result[user.friends[i]] = {online: online};
        }
        console.log("EMITTING TO /FRIENDS/");
        socket.emit('/friends/', result);
      }
    });
  });


  socket.on('/settings/changePassword', function(data){
    //check if correct old password
    User.findOne({ name: data.name, password: crypto.createHash('sha512').update(data.oldPassword).digest('hex')}, function(err, user){
          if (err) console.log(err);
          if (user) {
            console.log("updating password to: " + data.newPassword);
            user.password = crypto.createHash('sha512').update(data.newPassword).digest('hex');
            user.save(function (err) {
              if (err)
                socket.emit('/settings/changePassword', {error: "error"});
              else
                socket.emit('/settings/changePassword', {error: null});
            });
          } else {
            socket.emit('/settings/changePassword', {error: "wrong old password"});
          }
   });
  });


  socket.on('disconnect', function(data){
    console.log("CLIENT DISCONNECTED");
    console.log("deleting " + socket.id);
    delete clients[socket.id];
    if (socket.session.username){
      // delete user from connected user list
      if (connectedUsers.indexOf(socket.session.username) > -1){
        deleteConnectedUser(socket.session.username, socket);
      }
    }
  });

});


function addConnectedUser(username, socket){
  connectedUsers.push(username);
  clientUsernames[username] = socket.id;
  socket.broadcast.emit("onlinestatus:"+username, {user: username, online: true});

  sendFriendRequestsIfExist(username);
}

function deleteConnectedUser(username, socket){
  connectedUsers.splice(connectedUsers.indexOf(username),1);
  delete clientUsernames[username];
  socket.broadcast.emit("onlinestatus:"+username, {user: username, online: false});
}

function getIdForUsername(username){
  return clientUsernames[username];
}

function addFriendRequest(username, friend){
  if (!friendRequests[username])
    friendRequests[username] = [];

  // only request if not already requested
  if (friendRequests[username].indexOf(friend) === -1){
    friendRequests[username].push(friend)

    // send friend request if user is online
    if (connectedUsers.indexOf(username) > -1){
      clients[getIdForUsername(username)].emit('friend:request', {requests: friendRequests[username]});
    }
  }
}

function sendFriendRequestsIfExist(username){
  if (friendRequests[username] && friendRequests[username].length > 0)
  clients[getIdForUsername(username)].emit('friend:request', {requests: friendRequests[username]});
}

function removeFriendRequest(username, friend){
  if (friendRequests[username] && friendRequests[username].indexOf(friend) > -1){
    console.log("REMOVE!");
    friendRequests[username].splice(friendRequests[username].indexOf(friend), 1);
  }
}