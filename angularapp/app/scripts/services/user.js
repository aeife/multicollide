'use strict';

angular.module('multicollide')
  .factory('user', function ($resource, $location, $rootScope, websocketApi) {
    // Service logic

    // Public API here
    return {
      changePassword: function(username, oldPassword, newPassword, callback){
        websocketApi.settings.changePassword.get({name: username, oldPassword: oldPassword, newPassword: newPassword}, function(data){
          console.log(data);
          callback(data);
        });
      },
      addFriend: function(username, callback){
        websocketApi.friend.add.get({name: username}, function(data){
          console.log(data);
          callback(data.error);
        });
      },
      deleteFriend: function(username, callback){
        websocketApi.friend.remove.get({name: username}, function(data){
          console.log(data);
          callback(data.error);
        });
      },
      newUser: function(user, callback){
        websocketApi.user.new.get(user, function(data){
          callback(data);
        });
      },
      getFriendsStatus: function(callback){
        websocketApi.friends.all.get(function(data){
          console.log('GOT FRIENDS STATUS:');
          console.log(data);
          callback(data);
        });
      },
      getUserInfo: function(username, callback) {
        console.log('getting user info for ' + username);

        websocketApi.user.info.get({name: username}, function(user){
          console.log('got user info');
          console.log(user);
          callback(user);
        });
      },
      getStatsUpdate: function(username, callback){
        return websocketApi.user.statsUpdate.on(username, function(data){
          callback(data);
        });
      },
      changeLanguageSetting: function(newLanguage){
        websocketApi.settings.newLanguage.emit(newLanguage);
      },
      ownUsername: function(){
        return $rootScope.username;
      }
    };
  });

