
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

console.log('../angularapp');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/app');
  app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.session({secret: '1234567890QWERTY', cookie: { httpOnly: false }}));
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

var userSchema = mongoose.Schema({
    name: String,
    games: Number
})
var User = mongoose.model('User', userSchema);




// SERVER APP

app.get('/', function (req, res) {
    res.render('index.html');
});

// app.get('/login', function (req, res) {
//     res.json({ha: "ha"});
// });


// API

app.get('/user/123', function (req, res) {
  console.log(req.session);
  if (req.session.loggedin){
    res.json({games: 321, friends: ['trick', 'tick', 'track'], username: "test"});
  } else {
    res.json({friends: ['false']});
  }
});

app.get('/test', function (req, res) {
  console.log(req.session);
  
  if (req.session.test){
    req.session.test = "test1";
    res.json({test: "YEAH"});
  } else {
    req.session.test = "test1";
    res.json({test: "NO"});
  }

});

app.post('/test', function (req, res) {
  console.log("reqBody:");
  console.log(req.body);
});

app.post('/login', function(req, res){
  console.log(req);
  console.log(req.session);
  console.log(req.body);      // your JSON

  if (req.body.username === "test" && req.body.password === "tester"){
    req.session.loggedin = true;
    req.session.username = "test";
    res.json({loggedin: true, id: 123});
  }


    var silence = new User({ name: 'Silence' })
  console.log(silence.name) // 'Silence'

  silence.save(function (err, silence) {
  if (err) console.log("ERR");
  });
  //response.send(request.body);    // echo the result back
});

app.post('/logout', function(req, res){
  console.log("LOGOUT");

  req.session.destroy = true;

  

  //response.send(request.body);    // echo the result back
});

app.get('/user/own', function (req, res) {

  if (req.session.loggedin){
    User.findOne({ name: req.session.username }, function(err, user){
      console.log(user);
      res.json(user);
    });
  }

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
