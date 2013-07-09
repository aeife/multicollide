'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $location, $rootScope, socketgenapi) {
    // Service logic

    // Public API here
    return {
      changePassword: function(username, oldPassword, newPassword, callback){
        socketgenapi.get.settings.changePassword({name: username, oldPassword: oldPassword, newPassword: newPassword}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      addFriend: function(username, callback){
        socketgenapi.get.friend.add({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      deleteFriend: function(username, callback){
        socketgenapi.get.friend.remove({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      newUser: function(user, callback){
        socketgenapi.get.user.new(user, function(data){
          callback(data);
        });
      },
      getFriendsStatus: function(callback){
        socketgenapi.get.friends.all(function(data){
          console.log('GOT FRIENDS STATUS:');
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      getUserInfo: function(username, callback) {
        console.log('getting user info for ' + username);

        socketgenapi.get.user.info({name: username}, function(user){
          if (user){
            console.log('got user info');
            console.log(user);
            $rootScope.$apply(callback(user));
          } else {
            $rootScope.$apply(function() {
              $location.path('/404');
            });
          }
        });
      },
      changeLanguageSetting: function(newLanguage){
        socketgenapi.emit.settings.newLanguage(newLanguage);
      }
    };
  });

