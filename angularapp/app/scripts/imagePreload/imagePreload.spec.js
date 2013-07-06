'use strict';

describe('Service: imagePreload', function () {

  // load the service's module
  beforeEach(module('imagePreload'));

  // instantiate service
  var imagePreload;
  beforeEach(inject(function (_imagePreload_) {
    imagePreload = _imagePreload_;
  }));

  it('should contain 3 images after preload', function () {
    imagePreload.preload(['img1', 'img2', 'img3']);
    expect(Object.keys(imagePreload.preloadImages).length).toBe(3);
  });

  it('should add images on preload', function () {
    imagePreload.preload(['views/img1', 'views/img2', 'views/img3']);
    expect(imagePreload.getImage('views/img2').src).toContain('views/img2');
  });

});
