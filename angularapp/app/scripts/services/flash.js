'use strict';

angular.module('angularappApp')
  .factory('flash', function ($rootScope) {
    // Service logic


    var messages = [];

    $rootScope.$on('$routeChangeSuccess', function() {
      if (messages.length > 0) {
        messages = [];
      }

    });

    // Public API here
    return {
      clear: function(){
        console.log('clearing flash');
        messages = [];
      },
      get: function() {
        return messages;
      },
      info: function(message){
        console.log('adding message');
        messages.push({msg: message, type: 'info'});
        $rootScope.$emit('event:added');
        console.log(messages);
      },
      error: function(message){
        messages.push({msg: message, type: 'error'});
        $rootScope.$emit('event:added');
      },
      remove: function(nr){
        messages.splice(nr,1);
      }
    };
  })
  .directive('flashbox', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'views/flash.html',
      controller: function($scope, flash){
        $scope.flash = flash;
        // $scope.message = flash.get().msg;
        // $rootScope.$on('event:added', function(event){
        //   console.log(event);
        //   console.log(flash.get());
        //   $scope.flash = flash.get();
        //   // flash.clear();
        // });

        $scope.removeFlash = function (nr) {
          flash.remove(nr);
          console.log('removing');
          console.log(nr);
        };
      }
    };
  });
