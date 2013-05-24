'use strict';

describe('Filter: toArray', function () {

  // load the filter's module
  beforeEach(module('angularappApp'));

  // initialize a new instance of the filter before each test
  var toArray;
  beforeEach(inject(function ($filter) {
    toArray = $filter('toArray');
  }));

  it('should convert a object to an instance of array', function () {
    var obj = {k1: "v1", k2: "v2"};
    expect(toArray(obj) instanceof Array).toBe(true);
  });

});
