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
        on: {
          onlinestatus: function(username, callback){
            return on('onlinestatus:'+username, callback);
          }
        },
        get: {
          users: {
            connected: function(callback){
              emit('users:connected');
              once('users:connected', function (err, data){
                $rootScope.$apply(callback(err, data));
              });
            },
            all: function(callback){
              emit('users:all');
              once('users:all', function (err, data){
                $rootScope.$apply(callback(err, data));
              });
            }
          }
        }
      }

    return socketApi;
  });
