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
  this.param = url.split(":");
  this.url = this.param[0];
  this.param = this.param[this.param.length-1];
  this.socket = socket;
}

SocketResourceFactory.prototype = {
  get: function(query, callbackSuccess, callbackError){
    query.type = "get";
    this.socket.emit(this.url, query);

    this.socket.once(this.url+query[this.param], function (data){
      if (data)
        callbackSuccess(data);
      else
        callbackError();
    });
  },
  post: function(query, callback){
    query.type = "post";
    console.log(this.url);
    this.socket.emit(this.url, query);
    this.socket.once(this.url, function (data){
      callback(data);
    });
  },
  remove: function(query, callback){
    query.type = "remove";
    console.log(this.url);
    this.socket.emit(this.url, query);
    this.socket.once(this.url+query[this.param], function (data){
      callback(data);
    });
  }
}
