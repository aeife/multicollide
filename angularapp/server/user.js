'use strict';



module.exports = {
  listen: function(io){
    var crypto = require('crypto');
    var db = require('./database');
    var socketServer = require('./socketServer');

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
      } else if (socket.session.username.indexOf('Guest') > -1 && socketServer.connectedUsers.indexOf(socket.session.username) > -1){
        // user was guest before he logged in (= he is already connected in as a guest)
        deleteConnectedUser(socket.session.username, socket);
        // socket.session.username = username;
        setSession('username', username, socket);
      }
      // socket.session.save();
      socketServer.connectedUsers.push(username);
      socketServer.clientUsernames[username] = socket.id;
      socket.broadcast.emit('onlinestatus:'+username, {user: username, online: true});

      sendFriendRequestsIfExist(username);
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
      socketServer.connectedUsers.splice(socketServer.connectedUsers.indexOf(username),1);
      delete socketServer.clientUsernames[username];
      socket.broadcast.emit('onlinestatus:'+username, {user: username, online: false});
    }

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
      } while (socketServer.connectedUsers.indexOf('Guest'+randNr) > -1);

      return 'Guest'+randNr;
    }

    /**
     * emits all pending friend requests to specific user
     * @param  {string} username Name of the user for the requests
     */
    function sendFriendRequestsIfExist(username){
      // @TODO: no db queries for guests
      db.User.findOne({ name: username }, {password : 0}, function(err, user){
        // console.log(user);

        // only request if not already requested (so no multiple requests are possible)
        if (user && user.requests.length > 0){
          socketServer.clients[socketServer.getIdForUsername(username)].emit('friend:request', {requests: user.requests});
        }
      });

    }

    io.sockets.on('connection', function(socket){
      socket.session = socket.handshake.session;
      console.log("GOT USER CONNECTION");

      // if user is already logged in: add to connected user list
      // if (socket.session.username && socketServer.connectedUsers.indexOf(socket.session.username) === -1){
      // if (socket.session.username && socket.session.loggedin && socketServer.connectedUsers.indexOf(socket.session.username) === -1){
      if (socketServer.connectedUsers.indexOf(socket.session.username) === -1){
        addConnectedUser(socket.session.username, socket);
      }

      // send success message with username
      // @TODO: Sessions for Guest or delete on exit?
      socket.emit('successfullConnected', {username: socket.session.username});

      /**
       * sign up a new account
       * @param  {object} data {username, password, email}
       */
      socket.on('user:new', function(data){
        var user = new db.User({name: data.username, password: crypto.createHash('sha512').update(data.password).digest('hex'), email: data.email});
        user.save(function (err, user) {
          var error = null;
          if (err) {
            console.log(err);
            if (err.code === 11000) {
              error = 'duplicate name';
            }
          }
          socket.emit('user:new', {error: error});
        });
      });

      /**
       * get user info
       * @param  {object} data {name}
       */
      socket.on('user:info', function(data){
        // console.log(socket.session.username);
        console.log(socket.session);
        db.User.findOne({ name: data.name }).populate('gamesParticipated').exec(function(err, user){
          console.log(user);
          if (user) {
            var userobj = user.toObject();

            //check if own user
            if (user.name === socket.session.username) {
              // own user only data
              userobj.own = true;
            } else {
              // delete own user only data
              // delete userobj.friends;
            }

            //check if currently online
            if (socketServer.connectedUsers.indexOf(user.name) > -1) {
              userobj.online = true;
            }

            socket.emit('user:info:'+data.name, db.removeSensibleData(userobj, socket.session.username));
          } else {
            socket.emit('user:info:'+data.name);
          }

        });

      });

      /**
       * get list of all users
       */
      // socket.on(websocketApi.get.users.all.msgkey, function(data){
      socket.on('users:all', function(data){
        console.log('GETTIN ALL USERS');
        db.User.find({}, {name : 1, _id : 0}, function(err, users){
          console.log(users);
          socket.emit('users:all', err, users);
        });
        // socket.emit('users:connected', {users: socketServer.connectedUsers});
      });

      /**
       * get list of current connected users
       */
      socket.on('users:connected', function(data){
        var err = null;
        socket.emit('users:connected', err, socketServer.connectedUsers);
      });

      /**
       * client wants to log in
       * @param  {object} data {username, password}
       */
      socket.on('user:login', function(data){
        console.log("GOT LOGIN");
        db.User.findOne({ name: data.username, password: crypto.createHash('sha512').update(data.password).digest('hex')}, function(err, user){
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
            console.log(socketServer.getIdForUsername(data.username));
            socket.emit('user:login', {loggedin: true, language: user.language});
          } else {
            socket.emit('user:login', {loggedin: false});
          }
        });
      });

      /**
       * user wants to log out
       */
      socket.on('user:logout', function(data){
        console.log('LOGGING USER OUT');

        // delete user from connected user list
        if (socketServer.connectedUsers.indexOf(socket.session.username) > -1){
          deleteConnectedUser(socket.session.username, socket);
        }

        console.log(socket.session);
        console.log(socket.session.username);
        socket.session.destroy();
        console.log(socket.handshake.sessionID);
        // sessionStore.destroy(socket.handshake.sessionID);

        // @TODO: do not delete and add connected user on logout, just change name and status
        socket.session.loggedin = null;
        socket.session.username = generateRandomGuestName();
        addConnectedUser(socket.session.username, socket);

        // console.log(socket.session);
        // console.log(socket.session.username);
        // req.session.destroy = true;

        // @TODO: send errors
        // send new generated guest username
        socket.emit('user:logout', {username: socket.session.username});
      });

      socket.on('disconnect', function(data){
        if (socket.session.username){
          // if user was logged in: delete user from connected user list
          if (socketServer.connectedUsers.indexOf(socket.session.username) > -1){
            deleteConnectedUser(socket.session.username, socket);
          }
        }
      });

    });
  }
};


