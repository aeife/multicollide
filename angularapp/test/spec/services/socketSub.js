'use strict';

describe('Service: socketSub', function () {

  // load the service's module
  beforeEach(module('angularappApp'));

  // instantiate service
  var socketSub;
  beforeEach(inject(function (_socketSub_) {
    socketSub = _socketSub_;
  }));

  it('should do something', function () {
    expect(!!socketSub).toBe(true);
  });

});
