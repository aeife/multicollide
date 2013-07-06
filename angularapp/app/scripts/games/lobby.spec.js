'use strict';

describe('Service: lobby', function () {

  // load the service's module
  beforeEach(module('games'));

  // instantiate service
  var lobby;
  beforeEach(inject(function (_lobby_) {
    lobby = _lobby_;
  }));

  // it('should do something', function () {
  //   expect(!!lobby).toBe(true);
  // });

});
