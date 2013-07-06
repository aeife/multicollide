'use strict';

angular.module('sockets')
  .factory('socketgenapi', function ($rootScope, socket, $dialog, $filter) {
    // Service logic
    // ...

    function convertCallback(callback){
      return function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        };
    }

    // Public API here
    var socketApi =
      {
        onlinestatus: function(username){
          return {
            on: function(callback){
              return socketApi.on('onlinestatus:'+username, callback);
            }
          };
        },
        on: function(msgname, callback){
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
      }


    return socketApi;
  });
