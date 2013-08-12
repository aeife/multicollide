'use strict';

angular.module('paginate', [])
  .factory('Paginate', function ($rootScope) {
    // Service logic
    // ...

    function Paginate(data, pageSize){
      this.data = data;
      this.pageSize = pageSize;
      this.maxPage = Math.ceil((this.data.length - 1) / this.pageSize);
      this.pageArray = new Array(Math.ceil(this.data.length / this.pageSize));
      this.update();
    }

    Paginate.prototype = {
      page: 0,
      startFrom: this.page*this.pageSize,
      limitTo: this.pageSize,
      changePage: function(newPage){
        this.page = newPage;
        this.update();
      },
      nextPage: function(){
        if (this.page+1 < this.maxPage){
          this.page++;
          this.update();
        }
      },
      previousPage: function(){
        if (this.page > 0 ) {
          this.page--;
          this.update();
        }
      },
      update: function(){
        this.startFrom = this.page*this.pageSize;
        this.limitTo = this.pageSize;
      }
    };

    // Public API here
    return Paginate;
  })
  .directive('paginate', function () {
    return {
      restrict: 'E',
      scope: {
        paginate: '='
      },
      templateUrl: 'scripts/paginate/paginate.html',
      controller: function($scope, $attrs){
      }
    };
  });
