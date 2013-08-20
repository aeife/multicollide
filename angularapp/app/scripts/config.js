'use strict';

var appConfig = {
  games: [
    {
      name: 'multicollide',
      description: {
        'en-US': 'A super awesome multiplayer game.',
        'de-DE': 'Ein super tolles Multiplayerspiel.'
      },
      module: 'multicollideGame',
      template: 'scripts/multicollide/multicollide.html',
      files: [
        'scripts/multicollide/multicollide.js',
        'scripts/multicollide/level.js',
        'scripts/multicollide/player.js',
        'scripts/multicollide/canvasRender.js',
        'scripts/multicollide/config.js'
      ],
      previewImage: 'scripts/multicollide/multicollide.png',
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
    },
    {
      name: 'mockGame',
      description: {
        'en-US': 'Just a placeholder game.'
      },
      module: 'mockGame',
      template: 'scripts/mockGame/mockGame.html',
      files: [
        'scripts/mockGame/mockGame.js'
      ],
      api: {}
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
