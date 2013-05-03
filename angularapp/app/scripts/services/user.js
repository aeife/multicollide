'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $location, socketResource, $rootScope) {
    // Service logic

    var User = $resource('/user/:name', {name:''});
    var Friend = $resource('/friend/:name');
    var socketFriend = socketResource('/friend/:name', {param: "test"});
    var socketFriends = socketResource('/friends/', {param: "test"});
    var socketUser = socketResource('/user/:name', {param: "test"});
    var socketSettingsChangePassword = socketResource('/settings/changePassword', {param: "test"});

    // Public API here
    return {
      changePassword: function(username, oldPassword, newPassword, callback){
        socketSettingsChangePassword.post({name: username, oldPassword: oldPassword, newPassword: newPassword}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      addFriend: function(username, callback){
        /* REST API */
        // var friend = new Friend({name: username});
        // friend.$save({}, function(data){
        //   callback(data.error);
        // });

        /* SOCKET API */
        socketFriend.post({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      deleteFriend: function(username, callback){
        /* REST API */
        // Friend.remove({name: username}, function(data){
        //   console.log("GOT RESPONSE");
        //   callback(data.error);
        // });

        /* SOCKET API */
        socketFriend.remove({name: username}, function(data){
          console.log(data);
          $rootScope.$apply(callback(data.error));
        });
      },
      newUser: function(username, password, callback){

        /* REST API */
        // var user = new User({name: username, password: password});
        // user.$save({}, function(data){
        //   console.log(data);
        //   callback(data);
        // });

        /* SOCKET API */
        socketUser.post({name: username, password: password}, function(data){
          callback(data);
        });

      },
      getFriendsStatus: function(callback){
        socketFriends.post({}, function(data){
          console.log("GOT FRIENDS STATUS:");
          console.log(data);
          $rootScope.$apply(callback(data));
        });
      },
      getUserInfo: function(username, callback) {
        console.log("getting user info for " + username);

        /* REST API */
        // var user = User.get({name: username}, function() {
        //   console.log("USER: ");
        //   console.log(user);
        //   callback(user);
        // }, function(err){
        //   console.log("ERROR");
        //   $location.path("/404")
        // })

        /* SOCKET API */
        socketUser.get({name: username}, function(user){
          console.log(user);
          $rootScope.$apply(callback(user));
        }, function(){
          $rootScope.$apply(function() {
            $location.path('/404');
          });
        });

        // var promise = $http.get('http://localhost:3000/user/own').then(function (response) {
        //   // The then function here is an opportunity to modify the response
        //   console.log("OWN USER DATA:");
        //   console.log(response);
        //   // The return value gets picked up by the then in the controller.
        //   return response.data;
        // });
        // // Return the promise to the controller
        // return promise;
      }


    };
  });

