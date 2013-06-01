'use strict';

describe('Service: flash', function () {

  // load the service's module
  beforeEach(module('angularappApp'));
  beforeEach(module('angularappAppMock.localization'));

  // instantiate service
  var flash;
  beforeEach(inject(function (_flash_) {
    flash = _flash_;
  }));

  // it('should do something', function () {
  //   expect(!!flash).toBe(true);
  // });

  it('should save added messages', function () {
    flash.error('generic error');
    flash.info('generic info');
    expect(flash.get().length).toBe(2);
  });

  it('should should delete the second messages', function () {
    flash.error('generic error');
    flash.info('generic info');
    flash.error('generic error2');

    flash.remove(1);
    expect(flash.get().length).toBe(2);
  });

});
