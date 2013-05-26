'use strict';

angular.module('angularappApp')
  .factory('socketApi', function ($rootScope, socket) {
    // Service logic
    // ...


    // Public API here
    return {
      friendRequest: function(callback){
        socket.on("friend:request", function(data){
          callback(data);
        })
      },
      games: function(callback){
        socket.emit("/games");
        socket.once("/games", function (data){
          callback(data);
        });
      },
      newLobby: function(callback){
        socket.emit("lobby:new");
        socket.once("lobby:new", function(data){
          callback(data);
        });
      },
      joinLobby: function(id, callback){
        socket.emit("lobby:join", {id: id});
        socket.once("lobby:join", function(data){
          callback(data);
        });

        
      },
      leaveLobby: function(id, callback){
        socket.emit("lobby:leave", {id: id});
        socket.once("lobby:leave", function(data){
          callback(data);
        });

        // remove listeners
        socket.removeAllListeners("lobby:player:joined", function(){
          console.log("successfull deleted all listeners for lobby:player:joined");
        })
      },
      listenLobbyPlayerJoined: function(callback){
        // register listeners
        socket.on("lobby:player:joined", function(data){
          console.log("player joined your lobby");
          console.log(data);
          callback(data);
        });
      },
      listenLobbyPlayerLeft: function(callback){
        socket.on("lobby:player:left", function(data){
          console.log("player left your lobby");
          console.log(data);
          callback(data);
        });
      }
    };
  });
