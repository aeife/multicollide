'use strict';

var appConfig = {
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
      ],
      api: {
        multicollide: {
          start: {
            on: {},
            emit: {}
          },
          end: {
            on: {},
            emit: {}
          },
          turn: {
            on: {}
          },
          changeDirection: {
            emit: {}
          }
        }
      }
    }
  ]
};



if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  // on server export config object
  module.exports = appConfig;
} else {
  // on client include files
  for (var i = 0; i < appConfig.games.length; i++){
    for (var j = 0; j < appConfig.games[i].files.length; j++){
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = appConfig.games[i].files[j];
      head.appendChild(script);
    }
  }
}
