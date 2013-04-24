
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
  console.log("client connected");

  socket.on('/user/', function(data){
    switch(data.type){
      // get /user/:name -> profile
      case "get":
        console.log("USERNAME FROM REST SESSION:");
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
            socket.emit('/login/', {loggedin: true});
          }
        });
      }
    }
  });

  socket.on('/logout/', function(data){
    switch(data.type){
      case "post":{
        console.log("LOGGING USER OUT");
        console.log(socket.session);
        console.log(socket.session.username);
        socket.session.destroy();
        console.log(socket.handshake.sessionID);
        sessionStore.destroy(socket.handshake.sessionID);
        socket.session = {};
        // console.log(socket.session);
        // console.log(socket.session.username);
        // req.session.destroy = true;
      }
    }
  });
});
