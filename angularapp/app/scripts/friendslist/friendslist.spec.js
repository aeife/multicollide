'use strict';

describe('Directive: friendslist', function () {
  beforeEach(module('friendslist'));
  beforeEach(module('multicollideMock.socket'));
  beforeEach(module('multicollideMock.localization'));
  beforeEach(module('sockets.websocketApi'));
  beforeEach(module('multicollideMock.auth'));
  beforeEach(module('socketgenApi'));
  beforeEach(module('user.userOp'));

  var FriendslistCtrl;
  var scope;
  var socket;
  var localization;
  var websocketApi;
  var auth;
  var user;

  beforeEach(inject(function ($rootScope, $compile, $controller, $injector) {
    scope = $rootScope.$new();
    socket = $injector.get('socket');
    localization = $injector.get('localization');
    websocketApi = $injector.get('websocketApi');
    auth = $injector.get('auth');
    user = $injector.get('user');

    FriendslistCtrl = $controller('FriendslistCtrl', {
      $scope: scope,
      socket: socket,
      localization: localization,
      auth: auth,
      user: user,
      websocketApi: websocketApi
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
    // user has to be logged in
    auth.changeLoginStatus(true);
    scope.$digest();
    socket.emit('friend:request', {requests: ['tester1', 'tester2', 'testuser']});
    expect(scope.requests.length).toBe(3);
  });
});
