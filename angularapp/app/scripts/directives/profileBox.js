'use strict';

angular.module('angularappApp')
  .directive('profileBox', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/profileBox.html',
      controller: function($scope, auth, user, popup, $dialog){

        $scope.logout = function(){
          auth.logout();
        };

        // watch for login status
        $scope.loggedIn = auth.isLoggedIn();


        $scope.$watch(auth.isLoggedIn, function(newValue, oldValue) {
          console.log('cookies changes!');
          $scope.loggedIn = auth.isLoggedIn();
          if (newValue) {

            console.log('fetching own user data!');
            user.getUserInfo(auth.key(), function(data){
              $scope.user = data;
            });
            // user.getUserInfo(auth.key).then(function(data) {
            //   $scope.user = data;
            // });
          }
        }, true);


        $scope.test = function(){
          // popup.confirm("testtitle", "testtext", function(){console.log("OKAY")});

          var title = 'This is a message box';
          var msg = 'This is the content of the message box';
          var btns = [{result:true, label: 'OK', cssClass: 'btn-primary'}, {result:false, label: 'Cancel'}];
          $dialog.messageBox(title, msg, btns)
            .open()
            .then(function(result){
              if (result) {
                console.log("okay");
              } else {
                console.log("cancel");
              }
          });
        };
      }
    };
  });
