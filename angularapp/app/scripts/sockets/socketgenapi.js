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

    function get(msgname, callback){
      emit(msgname);
      once(msgname, function (err, data){
        $rootScope.$apply(callback(err, data));
      });
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
              get('users:connected', callback);
            },
            all: function(callback){
              get('users:all', callback);
            }
          }
        }
      }


      var websocketApi = {
        on: {
          onlinestatus: {
            opts: {
              attach: "username"
            }
          },
          anotherOn: undefined
        },
        get: {
          users: {
            connected: undefined,
            all: undefined
          },
          games: undefined
        }
      }

      function processSocketApi (obj){
        // t.get.user.connected = function()....
        Object.keys(obj).forEach(function(key) {
          console.log("ITERATE FOR: " + key);
            var msg = "";
            iterate(obj[key], msg, key);
        });
      }

      function iterate(obj, msg, type) {
        for (var property in obj) {
          if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object" && !obj[property].opts) {
              // continue iterating till at the deepest level
              iterate(obj[property], msg ? msg + ":" + property : property, type);
            } else {
              // process found end attribute
              var m = msg ? msg + ":" + property : property;

              // look for options
              var opts = {};
              if (obj[property] && obj[property].opts && obj[property].opts.attach){
                opts = obj[property].opts;
              }

              if (type === "get"){

                obj[property] = function(m){
                  return function(callback){
                    get(m, callback);
                  };
                }(m);

              } else if (type === "on"){

                obj[property] = function(m){
                  if (opts.attach){
                    return function(msg, callback){
                      return on(m + ':' + msg, callback);
                    };
                  } else {
                    return function(callback){
                      return on(m, callback);
                    };
                  }
                }(m);

              }
            }
          }
        }
      }

      processSocketApi(websocketApi);

      console.log(websocketApi);
    return websocketApi;
  });
