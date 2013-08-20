'use strict';

angular.appConfig = {
  games: [
    {
      name: 'multicollide',
      module: 'multicollideGame',
      files: [
        'scripts/multicollide/multicollide.js',
        'scripts/multicollide/level.js',
        'scripts/multicollide/player.js',
        'scripts/multicollide/canvasRender.js',
        'scripts/multicollide/config.js'
      ]
    }
  ]
};

for (var i = 0; i < angular.appConfig.games.length; i++){
  for (var j = 0; j < angular.appConfig.games[i].files.length; j++){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = angular.appConfig.games[i].files[j];
    head.appendChild(script);
  }
}
