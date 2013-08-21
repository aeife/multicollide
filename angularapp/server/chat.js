'use strict';



module.exports = {
  listen: function(io){
    var user = require('./user');

    var chatUsers = [];

    io.sockets.on('connection', function(socket){

      socket.on('chat:join', function(){
        chatUsers.push(socket.session.username);
        socket.join('chat');
        socket.emit('chat:join', null, {chatUsers: chatUsers});

        // send player join to all chat users
        socket.broadcast.to('chat').emit('chat:user:joined', {username: socket.session.username});
      });

      // listen for internal login and logout event to leave chat
      user.events.on('userLoginBefore', function(params){
        leaveChat(socket, params.username);
      });
      user.events.on('userLogoutBefore', function(params){
        leaveChat(socket, params.username);
      });

      socket.on('chat:message', function(data){
        io.sockets.in('chat').emit('chat:message', {username: socket.session.username, message: data.message});
      });

      socket.on('chat:leave', function(){
        socket.emit('chat:leave', null, {});

        // send player leave to all chat users
        leaveChat(socket, socket.session.username);
      });

      socket.on('disconnect', function(data){
        // leave chat if in chat
        leaveChat(socket, socket.session.username);
      });
    });

    function leaveChat(socket, username){
      if (chatUsers.indexOf(username) > -1){
        socket.leave('chat');
        chatUsers.splice(chatUsers.indexOf(username), 1);
        io.sockets.in('chat').emit('chat:user:left', {username: username});
      }
    }
  }
};
