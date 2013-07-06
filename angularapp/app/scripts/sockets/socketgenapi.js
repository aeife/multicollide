'use strict';

angular.module('sockets')
  .factory('socketgenapi', function ($rootScope, socket, $dialog, $filter) {
    // Service logic
    // ...


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
          var callbackConverted = function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          };

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
