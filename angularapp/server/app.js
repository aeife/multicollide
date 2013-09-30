'use strict';

/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http'),
  path = require('path'),
  secret = 'some secret',
  sessionKey = 'express.sid',
  cookieParser = express.cookieParser(secret),
  // sessionStore = new express.session.MemoryStore(),
  MongoStore = require('connect-mongo')(express);

var sessionStore = new MongoStore({
  url: 'mongodb://localhost:27017/multicollideSessions'
});

var app = express();

console.log(__dirname);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  // app.set('views', __dirname + '/../app');
  // app.engine('html', require('ejs').renderFile);
  // app.use(express.bodyParser());
  app.use(express.logger('dev'));
  app.use(cookieParser);
  app.use(express.session({store: sessionStore, key: sessionKey, cookie: { httpOnly: false }}));
  app.use(express.compress());
  // app.use(require('grunt-contrib-livereload/lib/utils').livereloadSnippet);
  app.use(express.static(__dirname + '/../app'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// server
var server = http.createServer(app)
.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// socket server
var socketServer = require('./socketServer.js');
socketServer.startServer(server, cookieParser, sessionStore, sessionKey);

// for grunt
exports = module.exports = server;
// delegates user() function
exports.use = function() {
  app.use.apply(app, arguments);
};
