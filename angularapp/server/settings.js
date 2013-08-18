'use strict';



module.exports = {
  listen: function(io){
    var crypto = require('crypto');
    var db = require('./database');

    io.sockets.on('connection', function(socket){
      /**
       * client wants to change his password
       * only when logged in
       *
       * @param  {object} data {name, oldPassword, newPassword}
       */
      socket.on('settings:changePassword', function(data){
        //check if user is logged in
        if (socket.session.loggedin) {
          //check if correct old password, then change
          db.User.findOne({ name: data.name, password: crypto.createHash('sha512').update(data.oldPassword).digest('hex')}, function(err, user){
            if (err) {
              console.log(err);
            }
            if (user) {
              console.log('updating password to: ' + data.newPassword);
              user.password = crypto.createHash('sha512').update(data.newPassword).digest('hex');
              user.save(function (err) {
                if (err) {
                  socket.emit('settings:changePassword', {error: 'error'});
                } else {
                  socket.emit('settings:changePassword', {error: null});
                }
              });
            } else {
              socket.emit('settings:changePassword', {error: 'wrong old password'});
            }
          });
        } else {
          socket.emit('settings:changePassword', {error: 'only use this api when logged in'});
        }
      });

      /**
       * client wants to set a new language
       * new language is saved to database if client is logged in (but should not be emitted from client anyway when not logged in)
       *
       * @param  {object} data {newLanguage}
       */
      socket.on('settings:newLanguage', function(data){
        if (socket.session.loggedin) {
          db.User.findOne({ name: socket.session.username}, function(err, user){
            if (err) {
              console.log(err);
            }
            if (user) {
              user.language = data.newLanguage;
              user.save(function(err){
                if (err) {
                  console.log(err);
                }
              });
            }
          });
        }
      });
    });
  }
};


