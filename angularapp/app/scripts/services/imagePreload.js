'use strict';

angular.module('angularappApp')
  .factory('imagePreload', function () {
    return {
      preloadImages: {},
      preload: function(imgArray){
        for (var i = 0; i < imgArray.length; i++) {
            var img = new Image();
            img.src = imgArray[i];
            this.preloadImages[imgArray[i]] = img;
        }
      },
      getImage: function(src){
        return this.preloadImages[src];
      }
    };
  })
  .directive('pimg', function (imagePreload) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.append(imagePreload.getImage(attrs.src));
      }
    };
  });
