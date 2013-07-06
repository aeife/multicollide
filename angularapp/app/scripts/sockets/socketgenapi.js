'use strict';

angular.module('sockets')
  .factory('socketgenapi', function ($rootScope, socket, $dialog, $filter) {
    // Service logic

    function convertCallback(callback){
      return function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        };
    }

    function on(msgname, callback){
      var callbackConverted = convertCallback(callback);

      socket.onn(msgname, callbackConverted);

      return {
        forRoute: function(){
          $rootScope.$on('$routeChangeSuccess', function() {
            socket.removeListener(msgname, callbackConverted);
          });
        },
        stop: function(){
          console.log("SocketAPI: stop listener for " + msgname);
          socket.removeListener(msgname, callbackConverted);
        }
      };
    }

    function once(msgname, callback){
      socket.once(msgname, callback);
    }

    function emit(msgname, data){
      socket.emit(msgname, data);
    }

    // Public API here
    var socketApi =
      {
        onlinestatus: function(username){
          return {
            on: function(callback){
              return on('onlinestatus:'+username, callback);
            }
          };
        },
        connectedUsers: {
          get: function(callback){
            emit('users:connected');
            once('users:connected', function (err, data){
              $rootScope.$apply(callback(err, data));
            });
          }
        },
        allUsers: {
          get: function(callback){
            emit('users:all');
            once('users:all', function (err, data){
              $rootScope.$apply(callback(err, data));
            });
          }
        }

      }

    return socketApi;
  });
