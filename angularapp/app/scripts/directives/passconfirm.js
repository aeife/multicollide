'use strict';

angular.module('angularappApp')
  .directive('passconfirm', function () {
    return {
      // template: '<div></div>',
      // restrict: 'E',
      // link: function postLink(scope, element, attrs) {
      //   element.text('this is the passconfirm directive');
      // }
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function (viewValue, $scope) {
          var noMatch = viewValue !== scope.form.password.$viewValue;
          ctrl.$setValidity('noMatch', !noMatch);
        });
      }
    };
  });
