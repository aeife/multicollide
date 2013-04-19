
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
  app.use(express.session({secret: '1234567890QWERTY'}));
  app.use(express.compress());
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
    res.render('index.html');
});


app.get('/user/123', function (req, res) {
  console.log(req.session);
  if (req.session.loggedin){
    res.json({games: 321, friends: ['trick', 'tick', 'track']});
  } else {
    res.json({games: 321, friends: ['false']});
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
    res.json({loggedin: true});
  }

  //response.send(request.body);    // echo the result back
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
