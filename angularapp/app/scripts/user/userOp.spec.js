'use strict';

describe('Service: user', function () {

  // load the service's module
  beforeEach(module('user.userOp'));
  beforeEach(module('socketgenApi'));
  beforeEach(module('sockets.websocketApi'));
  beforeEach(module('multicollideMock.socket'));


  // instantiate service
  var user, socket;
  beforeEach(inject(function (_user_, _socket_) {
    user = _user_;
    socket = _socket_;
  }));

  it('should do something', function () {
    expect(!!user).toBe(true);
  });

  it('should get friends status', function () {
    var received = false;
    user.getFriendsStatus(function(data){
      received = !!data;
    });

    socket.emit('friends:all', {requests: ['tester1', 'tester2', 'testuser']});

    expect(received).toBe(true);
  });

});
