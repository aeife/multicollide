'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $location, socketResource, $rootScope) {
    // Service logic

    var User = $resource('/user/:name', {name:''});
    var Friend = $resource('/friend/:name');
    var socketUser = socketResource('/user/:name', {param: "test"});

    // Public API here
    return {
      addFriend: function(username, callback){
        var friend = new Friend({name: username});
        friend.$save({}, function(data){
          callback(data.error);
        });
        // Friend.$save({name: username}, function(data){

        // });
      },
      deleteFriend: function(username, callback){
        Friend.remove({name: username}, function(data){
          console.log("GOT RESPONSE");
          callback(data.error);
        });
      },
      newUser: function(username, password, callback){

        /* REST API */
        var user = new User({name: username, password: password});
        user.$save({}, function(data){
          console.log(data);
          callback(data);
        });

        /* SOCKET API */
        // socketUser.post({name: username, password: password}, function(data){
        //   callback(data);
        // });

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
          callback(user);
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

