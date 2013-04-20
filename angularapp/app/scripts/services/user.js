'use strict';

angular.module('angularappApp')
  .factory('user', function ($resource, $http) {
    // Service logic
    // ...

    var OwnUser = $resource('http://localhost\\:3000/user/own', {});
    var User = $resource('/user/:name', {name:'name'});
    // var user = User.get({userId:123}, function() {
    //   user.abc = true;
    //   user.$save();
    // });

    // Public API here
    return {
      getUserInfo: function(username, callback) {

        var ownuser = User.get({name: username}, function() {
          console.log("OWN USER: ");
          console.log(ownuser);
          callback(ownuser);
        })

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

