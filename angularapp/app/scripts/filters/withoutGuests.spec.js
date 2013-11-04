'use strict';

describe('Filter: withoutGuests', function () {

  // load the filter's module
  beforeEach(module('filters'));

  // initialize a new instance of the filter before each test
  var withoutGuests;
  beforeEach(inject(function ($filter) {
    withoutGuests = $filter('withoutGuests');
  }));

  it('should clear out names with guest as leading substring"', function () {
    expect(withoutGuests([{name: 'Testuser'}, {name: 'Guest'}, , {name: 'Guestter'}, {name: 'TheGuester'}, {name: 'Guesser'}])).toEqual([{name: 'Testuser'}, {name: 'TheGuester'}, {name: 'Guesser'}]);
  });

});
