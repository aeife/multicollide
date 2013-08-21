'use strict';



module.exports = {
  listen: function(io){
    var db = require('./database');
    var socketServer = require('./socketServer');

    var chatUsers = [];

    io.sockets.on('connection', function(socket){


      socket.on('chat:join', function(){
        console.log(socket.session.username +  " joined the chat");
        chatUsers.push(socket.session.username);
        socket.join('chat');
        socket.emit('chat:join', null, {});

        // send player join to all chat users
        io.sockets.in('chat').emit('chat:user:joined', {username: socket.session.username});
      });

      socket.on('chat:message', function(data){
        io.sockets.in('chat').emit('chat:message', {username: socket.session.username, message: data.message});
      });

      socket.on('chat:leave', function(){
        console.log(socket.session.username +  " left the chat");
        chatUsers.splice(chatUsers.indexOf(socket.session.username), 1);
        socket.leave('chat');
        socket.emit('chat:leave', null, {});

        // send player leave to all chat users
        io.sockets.in('chat').emit('chat:user:left', {username: socket.session.username});
      });

      socket.on('disconnect', function(data){
        // leave chat if in chat
        if (chatUsers.indexOf(socket.session.username) > -1){
          chatUsers.splice(chatUsers.indexOf(socket.session.username), 1);
          // send player leave to all chat users
          io.sockets.in('chat').emit('chat:user:left', {username: socket.session.username});
        }
      });
    });
  }
};
