'use strict';

angular.module('sockets')
  .factory('websocketApi', function (socketgenApi) {

    // append game apis before processing
    var api = socketgenApi.init(appConfig.combinedApi());

    // initialization
    api.disconnect.on(function(){
      console.log("SHOW MODAL");
      $('#serverOfflineModal').modal('show');
      // <a data-toggle="modal" href="#serverOfflineModal" class="btn btn-primary btn-large">Launch demo modal</a>
      // var d = $dialog.dialog({templateUrl: 'views/msgServerOffline.html', backdropClick: false, keyboard: false});
      // d.open();
    });

    return api;
});
