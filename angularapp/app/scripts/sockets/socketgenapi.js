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
        },
        removeAll: function(){
          socket.removeAllListeners(msgname, function(){
            console.log('successfull deleted all listeners for ' + msgname);
          });
        }
      };
    }

    function once(msgname, callback){
      socket.once(msgname, callback);
    }

    function emit(msgname, data){
      socket.emit(msgname, data);
    }

    function get(msgname, callback, data){
      if (data){
        emit(msgname, data);
      } else {
        emit(msgname);
      }
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
          friend: {
            request: {},
            new: {},
            deleted: {}
          },
          lobby: {
            deleted: {},
            player: {
              joined: {},
              left: {}
            }
          }
        },
        get: {
          users: {
            connected: {},
            all: {}
          },
          games: {},
          lobby: {
            new: {},
            join: {
              opts: {
                emitData: "id"
              }
            },
            leave: {
              opts: {
                emitData: "id"
              }
            }
          }
        },
        emit: {
          friend: {
            accept: {},
            decline: {}
          }
        }
      }

      // // alternate order
      // var websocketApi1 = {
      //   onlinestatus: {
      //     on: undefined,
      //     opts: {
      //       attach: "username"
      //     }
      //   },
      //   users: {
      //     connected: {
      //       get: undefined
      //     },
      //     all: {
      //       get: undefined
      //     }
      //   },
      //   friend: {
      //     accept: {
      //       emit: undefined
      //     },
      //     decline: {
      //       emit: undefined
      //     },
      //     request: {
      //       on: undefined
      //     },
      //     new: {
      //       on: undefined
      //     }
      //   }
      // }

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
            if (typeof obj[property] == "object" && !obj[property].opts && Object.keys(obj[property]).length != 0) {
              // continue iterating till at the deepest level
              iterate(obj[property], msg ? msg + ":" + property : property, type);
            } else {
              // process found end attribute
              var m = msg ? msg + ":" + property : property;

              if (type === "get"){

                obj[property] = function(m, opts){
                  if (opts) {

                    return function(data, callback){
                      get(m, callback, data);
                    };

                  } else {

                    return function(callback){
                      get(m, callback);
                    };

                  }
                }(m, obj[property].opts);

              } else if (type === "on"){

                obj[property] = function(m, opts){
                  if (opts && opts.attach){

                    return function(msg, callback){
                      return on(m + ':' + msg, callback);
                    };

                  } else {

                    return function(callback){
                      return on(m, callback);
                    };

                  }
                }(m, obj[property].opt);

              } else if (type === "emit"){

                obj[property] = function(m){
                  return function(data){
                    emit(m, data);
                  };
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
