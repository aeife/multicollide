'use strict';

angular.module('layout', [])
  .controller('LayoutCtrl', function ($scope) {
    $scope.mainGridSize = 9;
    $scope.showSidebar = true;
    $scope.sidebarToggleBtnContent = "&laquo;";

    $scope.toggleSideBar = function(){
      $scope.showSidebar = !$scope.showSidebar;

      if ($scope.showSidebar){
        $scope.mainGridSize = 9;
      } else {
        $scope.mainGridSize = 12;
      }
    }
  });
