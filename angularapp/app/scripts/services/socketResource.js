'use strict';

angular.module('angularappApp')
  .factory('socketResource', function (socket) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // var User = $resource('/user/:name', {name:''});


    
    // Public API here
    console.log(SocketResourceFactory);
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
  get: function(query, callback){
    query.type = "get";
    this.socket.emit(this.url, query);
    this.socket.once(this.url, function (data){
      callback(data);
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
