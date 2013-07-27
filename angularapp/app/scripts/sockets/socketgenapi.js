'use strict';

angular.module('sockets')
  .factory('socketgenapi', function ($rootScope, socket, $dialog, websocketApi) {
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
          // dont use, each module should remove its own specific listeners
          socket.removeAllListeners(msgname);
        },
        once: function(){
          // remove normal listener
          this.stop();
          // @TODO: can message can be emitted in between?

          // add once listener
          socket.once(msgname, callbackConverted);

          return this;
        },
        whileLoggedIn: function() {
          var self = this;
          socket.once('user:logout', function(){
            self.stop();
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

    function get(msgname, callback, data, attach){
      if (data){
        emit(msgname, data);
      } else {
        emit(msgname);
      }

      // @TODO: always emit data? like socketgenapi.get.user.logout({}, function...)
      // @TODO: always send error as first parameter
      if (data && attach){
        // attach a string to the listener message
        once(msgname + ':' + data[attach], function (err, data){
          $rootScope.$apply(callback(err, data));
        });
      } else {
        once(msgname, function (err, data){
          $rootScope.$apply(callback(err, data));
        });
      }
    }

    // Public API here
    // var socketApi =
    //   {
    //     on: {
    //       onlinestatus: function(username, callback){
    //         return on('onlinestatus:'+username, callback);
    //       }
    //     },
    //     get: {
    //       users: {
    //         connected: function(callback){
    //           get('users:connected', callback);
    //         },
    //         all: function(callback){
    //           get('users:all', callback);
    //         }
    //       }
    //     }
    //   }

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
      var msg = "";
      iterate(obj, msg);
      // Object.keys(obj).forEach(function(key) {
      //     var msg = "";
      //     iterate(obj[key], msg, key);
      // });

      return obj;
    }

    function iterate(obj, msg) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object" && property !== 'emit' && property !== 'get' && property !== 'on' && Object.keys(obj[property]).length != 0) {
            // continue iterating till at the deepest level
            iterate(obj[property], msg ? msg + ":" + property : property);
          } else {
            // process found end attribute
            console.log(property);
            console.log(msg);
            var m = msg;
            // var m = msg ? msg + ":" + property : property;

            if (property === "get"){

              obj[property] = function(m, opts){

                if (opts && opts.emitData) {

                  return function(data, callback){
                    get(m, callback, data, opts.attach);
                  };

                } else {

                  return function(callback){
                    get(m, callback);
                  };

                }
              }(m, obj[property]);

            } else if (property === "on"){

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
              }(m, obj[property]);

            } else if (property === "emit"){

              obj[property] = function(m){
                return function(data){
                  emit(m, data);
                };
              }(m);

            } else if (property === "once"){
              obj[property] = function(m){
                return function(data){
                  once(m, data);
                };
              }(m);
            }
          }
        }
      }
    }


    websocketApi = processSocketApi(websocketApi.api);
    console.log('websocketApi:');
    console.log(websocketApi);

    // initialization
    websocketApi.disconnect.on(function(){
      var d = $dialog.dialog({templateUrl: 'views/msgServerOffline.html', backdropClick: false, keyboard: false});
      d.open();
    });

    return websocketApi;
  });
