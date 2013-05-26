'use strict';

describe('Filter: withoutGuests', function () {

  // load the filter's module
  beforeEach(module('angularappApp'));

  // initialize a new instance of the filter before each test
  var withoutGuests;
  beforeEach(inject(function ($filter) {
    withoutGuests = $filter('withoutGuests');
  }));

  // it('should return the input prefixed with "withoutGuests filter:"', function () {
  //   var text = 'angularjs';
  //   expect(withoutGuests(text)).toBe('withoutGuests filter: ' + text);
  // });

});
