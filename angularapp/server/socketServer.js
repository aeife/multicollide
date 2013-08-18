'use strict';

module.exports = {
  hooks: {
    connectionAfter: []
  },
  addHook: function(hook, functionToHook){
    hook.push(functionToHook);
  },
  includeHook: function(hook, params){
    if (hook){
      console.log("####GOT HOOK");
      for (var i = 0; i < hook.length; i++){
        hook[i](params);
      }
    }
  },
  // names of current connected users
  connectedUsers: [],
  // sockets for all connected clients ordered with socket ids
  clients: [],
  // saves ids for usernames
  clientUsernames: {},
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


    var websocketApi = require('../app/websocketApi.js')();
    websocketApi = websocketApi.generateStringObject(websocketApi.api);
    // websocketApi.generateStringObject();

    // INCLUDE
    var lobby = require('./lobby.js');
    lobby.listen(io);
    require('./user.js').listen(io);
    require('./friend.js').listen(io);
    require('./multicollide.js').listen(io);
    require('./settings.js').listen(io);

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

      // hook
      self.includeHook(self.hooks.connectionAfter, {socket: socket});

      /**
       * client requested list of open self.lobbies
       */
      socket.on('games', function(data){
        console.log('client requested games info');
        socket.emit('games', lobby.lobbies);
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
    });
  }
};



