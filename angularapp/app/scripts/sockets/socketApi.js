'use strict';

angular.module('sockets')
  .factory('socketApi', function ($rootScope, socket, $dialog, $filter) {
    // Service logic
    // ...


    // Public API here
    var socketApi =
      {
        getConnectedUsers: function(callback){
          socket.emit('users:connected');
          socket.once('users:connected', function (err, data){
            $rootScope.$apply(callback(err, data));
          });
        },
        getAllUsers: function(callback){
          socket.emit('users:all');
          socket.once('users:all', function (err, data){
            $rootScope.$apply(callback(err, data));
          });
        },
        getOnlineStatus: function(username, callback){
          var callbackConverted = function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          };

          socket.onn('onlinestatus:'+username, callbackConverted);

          return {stop: function(){
                      console.log("SocketAPI: stop listener for " + username);
                      socket.removeListener('onlinestatus:'+username, callbackConverted);
                    }
                  };
        },
        getOnlineStatusForRoute: function(username, callback){
          // convert callback to use $apply, then use onn
          // reason: function for listener and removeListener must be identical
          var callbackConverted = function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          };

          socket.onn('onlinestatus:'+username, callbackConverted);

          $rootScope.$on('$routeChangeSuccess', function() {
            socket.removeListener('onlinestatus:'+username, callbackConverted);
          });
        },
        friendRequest: function(callback){
          socket.on('friend:request', function(data){
            callback(data);
          });
        },
        friendAccept: function(data){
          socket.emit('friend:accept', data);
        },
        friendDecline: function(data){
          socket.emit('friend:decline', data);
        },
        listenFriendNew: function(callback){
          socket.on('friend:new', function(data){
            callback(data)
          });
        },
        listenFriendDeleted: function(callback){
          socket.on('friend:deleted', function(data){
            callback(data)
          });
        },
        games: function(callback){
          socket.emit('/games');
          socket.once('/games', function (data){
            callback(data);
          });
        },
        newLobby: function(callback){
          socket.emit('lobby:new');
          socket.once('lobby:new', function(data){
            callback(data);
          });
        },
        joinLobby: function(data, callback){
          socket.emit('lobby:join', data);
          socket.once('lobby:join', function(err, data){
            callback(err, data);
          });


        },
        leaveLobby: function(data, callback){
          socket.emit('lobby:leave', data);
          socket.once('lobby:leave', function(data){
            callback(data);
          });

          // remove listeners
          socket.removeAllListeners('lobby:player:joined', function(){
            console.log('successfull deleted all listeners for lobby:player:joined');
          });

          socket.removeAllListeners('lobby:player:left', function(){
            console.log('successfull deleted all listeners for lobby:player:left');
          });
        },
        listenLobbyPlayerJoined: function(callback){
          // register listeners
          socket.on('lobby:player:joined', function(data){
            console.log('player joined your lobby');
            console.log(data);
            callback(data);
          });
        },
        listenLobbyPlayerLeft: function(callback){
          socket.on('lobby:player:left', function(data){
            console.log('player left your lobby');
            console.log(data);
            callback(data);
          });
        },
        listenLobbyDeleted: function(callback){
          socket.on('lobby:deleted', function(data){
            console.log('lobby was deleted (host probably left lobby)');
            console.log(data);
            callback(data);
          });
        },
        listenServerShutdown: function(callback){
          socket.on('disconnect', function(data){
            callback(data);
          });
        },
        checkLoginStatus: function(callback){
          socket.on('successfullConnected', function(data){
            callback(data);
          });
        },
        changeLanguageSetting: function(newLanguage){
          socket.emit('settings:newLanguage', {newLanguage: newLanguage});
        }
      };

    socketApi.listenServerShutdown(function(){

      // @TODO: Load template (and image) before server shutdown to use it here

      var d = $dialog.dialog({templateUrl: 'views/msgServerOffline.html', backdropClick: false, keyboard: false});
      d.open();
    });

    return socketApi;

  });
