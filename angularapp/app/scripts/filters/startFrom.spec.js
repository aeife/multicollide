'use strict';

describe('Filter: startFrom', function () {

  // load the filter's module
  beforeEach(module('filters'));

  // initialize a new instance of the filter before each test
  var startFrom;
  beforeEach(inject(function ($filter) {
    startFrom = $filter('startFrom');
  }));

  it('should start from defined position', function () {
    var arr = [1,2,3,4,5];
    expect(startFrom(arr, 2).length).toBe(3);
    expect(startFrom(arr, 2)).toEqual([3,4,5]);
  });

});
