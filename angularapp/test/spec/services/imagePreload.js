'use strict';

describe('Service: imagePreload', function () {

  // load the service's module
  beforeEach(module('angularappApp'));

  // instantiate service
  var imagePreload;
  beforeEach(inject(function (_imagePreload_) {
    imagePreload = _imagePreload_;
  }));

  it('should do something', function () {
    expect(!!imagePreload).toBe(true);
  });

});
