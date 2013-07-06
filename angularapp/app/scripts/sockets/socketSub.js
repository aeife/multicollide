'use strict';

angular.module('sockets')
  .factory('socketSub', function (socket, $rootScope) {
    // Service logic
    // ...

    // Public API here
    return function(eventName, callback) {
      var ssub = new SocketSubFactory(eventName, callback, socket, $rootScope);
      return ssub;
    };
  });


function SocketSubFactory(eventName, callback, socket, $rootScope) {
  this.eventName = eventName;
  this.socket = socket;
  this.$rootScope = $rootScope;
  this.callback = function () {
    var args = arguments;
    $rootScope.$apply(function () {
      callback.apply(socket, args);
    });
  };
}

SocketSubFactory.prototype = {
  start: function(){
    console.log('start listening');
    this.socket.onn(this.eventName, this.callback);
  },
  stop: function(){
    console.log('stop listening');
    this.socket.removeListener(this.eventName, this.callback);
  },
  subForRoute: function(){
    this.start();
    var self = this;
    this.$rootScope.$on('$routeChangeSuccess', function() {
      self.stop();
    });
  }
};
