'use strict';

angular.module('sockets')
  .factory('socketgenapi', function ($rootScope, socket, websocketApi) {
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

      var callbackConverted = convertCallback(callback);
      // @TODO: always emit data? like socketgenapi.get.user.logout({}, function...)
      // @TODO: always send error as first parameter
      if (data && attach){
        // attach a string to the listener message
        once(msgname + ':' + data[attach], callbackConverted);
      } else {
        once(msgname, callbackConverted);
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
      var msg = "";
      iterate(obj, msg);
      return obj;
    }

    function generateOn(m, opts){
      if (opts && opts.attach){
        return function(msg, callback){
          return on(m + ':' + msg, callback);
        };
      } else {
        return function(callback){
          return on(m, callback);
        };
      }
    }

    function generateGet(m, opts){
      if (opts && opts.emitData) {
        return function(data, callback){
          get(m, callback, data, opts.attach);
        };
      } else {
        return function(callback){
          get(m, callback);
        };
      }
    }

    function generateEmit(m){
      return function(data){
        emit(m, data);
      };
    }

    function iterate(obj, msg) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object" && property !== 'emit' && property !== 'get' && property !== 'on' && Object.keys(obj[property]).length != 0) {
            // continue iterating till at the deepest message level
            iterate(obj[property], msg ? msg + ":" + property : property);
          } else {
            // process found end attribute
            if (property === "get"){

              obj[property] = generateGet(msg, obj[property]);

              // every get also includes single on
              obj['on'] = generateOn(msg, obj['on']);

            } else if (property === "on"){

              obj[property] = generateOn(msg, obj[property]);

            } else if (property === "emit"){

              obj[property] = generateEmit(msg);

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
      console.log("SHOW MODAL");
      $('#serverOfflineModal').modal('show');
      // <a data-toggle="modal" href="#serverOfflineModal" class="btn btn-primary btn-large">Launch demo modal</a>
      // var d = $dialog.dialog({templateUrl: 'views/msgServerOffline.html', backdropClick: false, keyboard: false});
      // d.open();
    });

    return websocketApi;
  });
