'use strict';

var EventEmitter = require('events').EventEmitter;

module.exports = {
  events: new EventEmitter(),
  // websocket api
  api: null,
  // names of current connected users
  connectedUsers: [],
  // sockets for all connected clients ordered with socket ids
  clients: [],
  // saves ids for usernames
  clientUsernames: {},
  // onlinestatus of each (connected) user, by user name
  onlinestatus: {},
  updateOnlinestatus: function(username, newStatus, socket){
    // create oblinestatus if not existend
    if (!this.onlinestatus[username]){
      this.onlinestatus[username] = {};
    }

    for (var attr in newStatus){
      this.onlinestatus[username][attr] = newStatus[attr];
    }

    // send new online status
    socket.broadcast.to(this.api.onlinestatus(username)).emit(this.api.onlinestatus(username), this.onlinestatus[username]);

    // if offline delete object
    if (!this.onlinestatus[username].online){
      delete this.onlinestatus[username];
    }
  },
  /**
   * returns the id (socket.id) for a given username
   * @param  {string} username Name of user
   * @return {id} socket.id
   */
  getIdForUsername: function(username){
    return this.clientUsernames[username];
  },
  startServer: function(server, cookieParser, sessionStore,sessionKey){
    var self = this;

    // socket.io listens on server
    var io = require('socket.io').listen(server);

    // include app config file
    var appConfig = require('../app/scripts/config.js');

    // include api and generate object with appended api
    this.api = require('../app/scripts/sockets/socketgenapi.js');
    // this.api = this.api.generateServerObject(this.api.appendGameApis(appConfig));
    this.api = this.api.init(appConfig.combinedApi());

    // INCLUDE
    var lobby = require('./lobby.js');
    lobby.listen(io);
    require('./user.js').listen(io);
    require('./friend.js').listen(io);
    require('./multicollide.js').listen(io);
    require('./settings.js').listen(io);
    require('./chat.js').listen(io);

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
      self.clients[socket.id] = socket;
      console.log('client connected as ' + socket.session.username);

      // internal event
      self.events.emit('connectionAfter', {socket: socket});

      /**
       * client requested list of open self.lobbies
       */
      socket.on(self.api.games, function(data){
        console.log('client requested games info');
        socket.emit(self.api.games, lobby.lobbies);
      });

      /**
       * client disconnected
       */
      socket.on('disconnect', function(data){
        console.log('client disconnected');

        delete self.clients[socket.id];
        // if (socket.session.username){
        //   // if user was logged in: delete user from connected user list
        //   if (self.connectedUsers.indexOf(socket.session.username) > -1){
        //     deleteConnectedUser(socket.session.username, socket);
        //   }
        // }
      });

      /**
       * Subscriptions
       */
      socket.on('subscribe', function(data){
        console.log('subscribing ' + socket.session.username + ' to ' + data.msg);
        socket.join(data.msg);
      });

      socket.on('unsubscribe', function(data){
        console.log('unsubscribing ' + socket.session.username + ' to ' + data.msg);
        socket.leave(data.msg);
      });
    });
  }
};



