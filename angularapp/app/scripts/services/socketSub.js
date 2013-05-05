'use strict';

angular.module('angularappApp')
  .factory('socketSub', function (socket) {
    // Service logic
    // ...


    var meaningOfLife = 42;

    // Public API here
    return function(eventName, callback, params) {
      var ssub = new SocketSubFactory(eventName, callback, socket);
      return ssub;
    }
  });


function SocketSubFactory(eventName, callback, socket) {
  this.eventName = eventName;
  this.callback = callback;
  this.socket = socket;
}

SocketSubFactory.prototype = {
  start: function(){
    console.log("start listening");
    this.socket.onn(this.eventName, this.callback);
  },
  stop: function(){
    console.log("stop listening");
    this.socket.removeListener(this.eventName, this.callback);
  }
}