'use strict';

describe('Directive: friendslist', function () {
  beforeEach(module('friendslist'));
  beforeEach(module('multicollideMock.socket'));
  beforeEach(module('multicollideMock.localization'));
  // beforeEach(module('multicollide'));

  var FriendslistCtrl,
      scope,
      socket,
      localization;

  beforeEach(inject(function ($rootScope, $compile, $controller, $injector) {
    scope = $rootScope.$new();
    socket = $injector.get('socket');
    localization = $injector.get('localization');

    FriendslistCtrl = $controller('FriendslistCtrl', {
      $scope: scope,
      socket: socket,
      localization: localization,
      auth: {},
      user: {},
      websocketApi: {}
    });
  }));

  it('friendsOnline should display correct number of friends with online status true', function(){
    console.log(scope.friends);
    scope.friends = {
      user1: {online: true},
      user2: {online: false}
    };
    expect(scope.friendsOnline(scope.friends)).toBe(1);
  });

  // it('should add request of each user on event', function(){
  //   socket.emit('friend:request', {requests: ['tester1', 'tester2', 'testuser']});
  //   expect(scope.requests.length).toBe(3);
  // });
});
