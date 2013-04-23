'use strict';

angular.module('angularappApp')
  .factory('socketResource', function (socket) {
    // Service logic
    // ...

    
    // Public API here
    return function(url, params) {
      var srf = new SocketResourceFactory(url, params, socket);
      return srf;
    }
    
  });

function SocketResourceFactory(url, params, socket) {
  this.url = url;
  this.socket = socket;


}

SocketResourceFactory.prototype = {
  get: function(query, callbackSuccess, callbackError){
    query.type = "get";
    this.socket.emit(this.url, query);
    this.socket.once(this.url+query.name, function (data){
      if (data)
        callbackSuccess(data);
      else
        callbackError();
    });
  },
  post: function(query, callback){
    query.type = "post";
    this.socket.emit(this.url, query);
    this.socket.once(this.url, function (data){
      callback(data);
    });
  }
}
