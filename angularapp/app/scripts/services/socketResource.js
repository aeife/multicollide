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
  test: function(){
    console.log("test");
  },
  get: function(query, callback){
    query.type = "get";
    this.socket.emit(this.url, query);

    var self = this;

    // dont register an event handler each time get is called
    this.socket.once(this.url, function (data){
      console.log(data);
      callback(data);
    });
  
  }
}
