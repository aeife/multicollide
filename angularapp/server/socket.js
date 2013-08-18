'use strict';

module.exports.startServer = function(server, cookieParser, sessionStore,sessionKey){

  var socketApp = {
    User: require('./database').User,
    Game: require('./database').Game,
    // names of current connected users
    connectedUsers: [],
    // sockets for all connected clients ordered with socket ids
    clients: {},
    // saves ids for usernames
    clientUsernames: {},
    // saves all current available socketApp.lobbies
    lobbies: {},
    // saves current lobby for each username
    lobbyForUsername: {},
    /**
     * returns the id (socket.id) for a given username
     * @param  {string} username Name of user
     * @return {id} socket.id
     */
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
    }
  };

  // socket.io listens on server
  var io = require('socket.io').listen(server);


  var websocketApi = require('../app/websocketApi.js')();
  websocketApi = websocketApi.generateStringObject(websocketApi.api);
  // websocketApi.generateStringObject();

  var STATES = require('../app/states.js')();


  // INCLUDE
  require('./lobby.js').listen(io, socketApp);
  require('./user.js').listen(io, socketApp);
  require('./friend.js').listen(io, socketApp);
  require('./multicollide.js').listen(io, socketApp);


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
    console.log('client connected as ' + socket.session.username);

    /**
     * client requested list of open socketApp.lobbies
     */
    socket.on('games', function(data){
      console.log('client requested games info');
      socket.emit('games', socketApp.lobbies);
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
  });
};
