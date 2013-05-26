'use strict';

angular.module('angularappApp')
  .factory('socketApi', function ($rootScope, socket) {
    // Service logic
    // ...


    // Public API here
    return {
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
      }
    };
  });
