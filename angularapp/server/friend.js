'use strict';



module.exports = {
  listen: function(io, socketApp){
    var db = require('./database');

    /**
     * adds a friend request for username from friend
     * @param {string} username Name of the user which receives the request
     * @param {string} friend Name of the user which sent the request
     */
    function addFriendRequest(username, friend){
      db.User.findOne({ name: username }, {password : 0}, function(err, user){
        console.log(user);

        // only request if not already requested (so no multiple requests are possible)
        if (user && user.requests.indexOf(friend) === -1){
          user.requests.push(friend);
          user.save(function (err) {
            if (err) {
              console.log(err);
            }

            // send friend request if user is online
            if (socketApp.connectedUsers.indexOf(username) > -1){

              socketApp.clients[socketApp.getIdForUsername(username)].emit('friend:request', {requests: user.requests});
            }
          });
        }
      });
    }

    /**
     * removes a friend request for username from friend
     * @param  {string} username Name of user which received the request
     * @param  {string} friend Name of user which sent the request
     */
    function removeFriendRequest(username, friend){
      db.User.findOne({ name: username }, {password : 0}, function(err, user){

        if (user && user.requests.indexOf(friend) > -1){
          user.requests.splice(user.requests.indexOf(friend), 1);
          console.log(user);
          user.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }

    io.sockets.on('connection', function(socket){
      /**
       * client wants to add friend
       * @param  {object} data {name}
       */
      socket.on('friend:add', function(data){
        console.log(socket.session.username + ' wants to add ' + data.name);
        addFriendRequest(data.name, socket.session.username);
      });

      /**
       * client wants to remove friend
       * @param  {object} data {name}
       */
      socket.on('friend:remove', function(data){
        // remove /friend/:name -> remove friend
        console.log(socket.session.username + ' wants to delete ' + data.name);

        // delete friend for both users
        db.User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
          user.friends.remove(data.name);
          user.save(function (err, user) {
            var error = false;
            if (err) {
              console.log(err);
              error = true;
            }
            socket.emit('friend:remove'+data.name, {error: error});

            // emit deleted friend
            socket.emit('friend:deleted', {user: data.name});
          });
        });

        db.User.findOne({ name: data.name }, {password : 0}, function(err, user){
          user.friends.remove(socket.session.username);
          user.save(function (err, user) {
            var error = false;
            if (err) {
              console.log(err);
              error = true;
            }

            // if other user is online: send deletion
            if (socketApp.clients[socketApp.getIdForUsername(data.name)]) {
              socketApp.clients[socketApp.getIdForUsername(data.name)].emit('/friend/'+socket.session.username, {error: error});

              // emit deleted friend
              socketApp.clients[socketApp.getIdForUsername(data.name)].emit('friend:deleted', {user: socket.session.username});
            }
          });
        });
      });

      /**
       * client accepted friend request
       * @param  {object} data user
       */
      socket.on('friend:accept', function(data){
        console.log(socket.session.username + ' accepts request from ' + data.user);

        // add friend for both users
        db.User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
          if (user.friends.indexOf(data.user) < 0){
            user.friends.push(data.user);
            user.save(function (err, user) {
              var error = false;
              if (err) {
                console.log(err);
                error = true;
              }
              // socket.emit('/friend/', {error: error});

              // emit new friend and his status
              if (!error) {
                var online = false;
                if (socketApp.connectedUsers.indexOf(data.user) > -1){
                  online = true;
                }
                socket.emit('friend:new', {user: data.user, online: online});

                // add to other user
                // @TODO: do parallel
                db.User.findOne({ name: data.user }, {password : 0}, function(err, user){
                  if (user.friends.indexOf(socket.session.username) < 0){
                    user.friends.push(socket.session.username);
                    user.save(function (err, user) {
                      var error = false;
                      if (err) {
                        console.log(err);
                        error = true;
                      }

                      // TODO: if done parallel above: wait for db and check for errors first
                      removeFriendRequest(socket.session.username, data.user);

                      // only emit to other user when he is online
                      if (socketApp.connectedUsers.indexOf(data.user) > -1){
                        // socketApp.clients[getIdForUsername(data.user)].emit('/friend/', {error: error});

                        // emit new friend and his status
                        if (!error) {
                          var online = false;
                          if (socketApp.connectedUsers.indexOf(socket.session.username) > -1){
                            online = true;
                          }
                          socketApp.clients[socketApp.getIdForUsername(data.user)].emit('friend:new', {user: socket.session.username, online: online});
                        }
                      }
                    });
                  }
                });

              }
            });
          }
        });
      });

      /**
       * client declined friend request
       * @param  {object} data {user}
       */
      socket.on('friend:decline', function(data){
        console.log(socket.session.username + ' declines friend request from ' + data.user);
        removeFriendRequest(socket.session.username, data.user);
      });


      /**
       * client wants list of all friends status
       */
      socket.on('friends:all', function(data){
        console.log('GETTING FRIENDS STATUS');

        var result = {};
        //getting all friends and check their status
        db.User.findOne({ name: socket.session.username }, {password : 0}, function(err, user){
          if (err) {
            console.log(err);
          }

          if (user){
            console.log(user);
            for (var i = 0; i < user.friends.length; i++){
              var online = false;
              if (socketApp.connectedUsers.indexOf(user.friends[i]) > -1){
                online = true;
              }
              result[user.friends[i]] = {online: online};
            }
            console.log('EMITTING TO /FRIENDS/');
            socket.emit('friends:all', result);
          }
        });
      });
    });
  }
};

