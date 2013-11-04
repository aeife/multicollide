var assert = require('assert');
var socketServer = require('../socketServer.js');

describe('Test', function(){
  it('just a test', function(){
    socketServer.startServer();
    assert.equal(socketServer.api, null);
  });
});
