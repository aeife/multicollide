'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $location, socketResource, $rootScope, socketgenapi) {
    // Service logic

    // var User = $resource('/user/:name', {name:''});
    // var Friend = $resource('/friend/:name');
    var socketFriend = socketResource('/friend/:name', {param: 'test'});
    var socketFriends = socketResource('/friends/', {param: 'test'});
    var socketUser = socketResource('/user/:name', {param: 'test'});
    var socketSettingsChangePassword = socketResource('/settings/changePassword', {param: 'test'});

    // Public API here
    return {
      changePassword: function(username, oldPassword, newPassword, callback){
        socketSettingsChangePassword.post({name: username, oldPassword: oldPassword, newPassword: newPassword}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      addFriend: function(username, callback){
         socketFriend.post({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      deleteFriend: function(username, callback){
         socketFriend.remove({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      newUser: function(user, callback){
        socketUser.post(user, function(data){
          callback(data);
        });

      },
      getFriendsStatus: function(callback){
        socketFriends.post({}, function(data){
          console.log('GOT FRIENDS STATUS:');
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      getUserInfo: function(username, callback) {
        console.log('getting user info for ' + username);

        socketUser.get({name: username}, function(user){
          console.log(user);
          $rootScope.$apply(callback(user));
        }, function(){
          $rootScope.$apply(function() {
            $location.path('/404');
          });
        });
      },
      changeLanguageSetting: function(newLanguage){
        socketgenapi.emit.settings.newLanguage(newLanguage);
      }
    };
  });

