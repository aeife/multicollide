'use strict';

describe('Directive: friendslist', function () {
  beforeEach(module('angularappApp'));
  beforeEach(module('angularappAppMock.socket'));
  beforeEach(module('angularappAppMock.localization'));

  var FriendslistCtrl,
      scope,
      socket;

  beforeEach(inject(function ($rootScope, $compile, $controller, $injector) {
    scope = $rootScope.$new();
    socket = $injector.get('socket');

    FriendslistCtrl = $controller('FriendslistCtrl', {
      $scope: scope,
      socket: socket
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

  it('should add request of each user on event', function(){
    socket.emit('friend:request', {requests: ['tester1', 'tester2', 'testuser']});
    expect(scope.requests.length).toBe(3);
  });
});
