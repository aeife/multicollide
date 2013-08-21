'use strict';



module.exports = {
  listen: function(io){
    var db = require('./database');
    var socketServer = require('./socketServer');


    io.sockets.on('connection', function(socket){
      socket.on('chat:join', function(){
        console.log(socket.session.username +  " joined the chat");
        socket.join('chat');
        socket.emit('chat:join', null, {});
      });

      socket.on('chat:message', function(data){
        io.sockets.in('chat').emit('chat:message', {username: socket.session.username, message: data.message});
      });

      socket.on('chat:leave', function(){
        console.log(socket.session.username +  " left the chat");
        socket.leave('chat');
        socket.emit('chat:leave', null, {});
      });
    });
  }
};

