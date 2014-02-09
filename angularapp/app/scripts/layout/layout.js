'use strict';

angular.module('layout', [])
  .controller('LayoutCtrl', function ($scope, $rootScope) {
    $scope.mainGridSize = 8;
    $rootScope.showSidebar = true;
    $scope.sidebarToggleBtnContent = "&laquo;";

    $scope.toggleSideBar = function(){
      $rootScope.showSidebar = !$rootScope.showSidebar;

      if ($scope.showSidebar){
        $scope.mainGridSize = 8;
      } else {
        $scope.mainGridSize = 12;
      }
    }
  });
