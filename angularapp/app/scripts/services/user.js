'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $location, $rootScope, socketgenapi) {
    // Service logic

    // Public API here
    return {
      changePassword: function(username, oldPassword, newPassword, callback){
        socketgenapi.settings.changePassword.get({name: username, oldPassword: oldPassword, newPassword: newPassword}, function(data){
          console.log(data);
          callback(data);
        });
      },
      addFriend: function(username, callback){
        socketgenapi.friend.add.get({name: username}, function(data){
          console.log(data);
          callback(data.error);
        });
      },
      deleteFriend: function(username, callback){
        socketgenapi.friend.remove.get({name: username}, function(data){
          console.log(data);
          callback(data.error);
        });
      },
      newUser: function(user, callback){
        socketgenapi.user.new.get(user, function(data){
          callback(data);
        });
      },
      getFriendsStatus: function(callback){
        socketgenapi.friends.all.get(function(data){
          console.log('GOT FRIENDS STATUS:');
          console.log(data);
          callback(data);
        });
      },
      getUserInfo: function(username, callback) {
        console.log('getting user info for ' + username);

        socketgenapi.user.info.get({name: username}, function(user){
          console.log('got user info');
          console.log(user);
          callback(user);
        });
      },
      getStatsUpdate: function(username, callback){
        return socketgenapi.user.statsUpdate.on(username, function(data){
          callback(data);
        });
      },
      changeLanguageSetting: function(newLanguage){
        socketgenapi.settings.newLanguage.emit(newLanguage);
      },
      ownUsername: function(){
        return $rootScope.username;
      }
    };
  });

