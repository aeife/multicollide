'use strict';

angular.module('apiLoader', [])
  .factory('apiLoader', function ($http) {
    var apiLoader = {
      api: {},
      load: function(){
        var self = this;
        console.log("load api");
        $http.get('../../websocketApi.json').success(function(data) {
          console.log('loaded websocketAPi');
          console.log(data);
          // websocketApi = JSON.parse(data);
          self.api = data;
        });
      }
    };

    apiLoader.load();

    return apiLoader;
  });
