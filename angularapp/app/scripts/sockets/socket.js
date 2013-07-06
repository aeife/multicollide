'use strict';

angular.module('sockets', [])
  .factory('socket', function ($rootScope) {
    var socket = io.connect();
    // var socket = io.connect("http://localhost:3000");
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      },
      once: function (eventName, data, callback) {
        socket.once(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      },
      removeListener: function (eventName, callback) {
        socket.removeListener(eventName, callback);
      },
      removeAllListeners: function (eventName, callback) {
        socket.removeAllListeners(eventName, callback);
      },
      onn: function (eventName, callback) {
        socket.on(eventName, callback);
      }
    };
  });
