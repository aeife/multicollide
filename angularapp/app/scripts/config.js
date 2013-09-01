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
      },
      help: {
        'en-US': 'Kind of multiplayer snake. Collect items and avoid collisions. Last player alive wins.'
      }
    },
    {
      name: 'mockGame',
      description: {
        'en-US': 'Just a placeholder game.'
      },
      module: 'mockGame',
      template: 'scripts/mockGame/mockGame.html',
      api: {}
    }
  ]
};



if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  // on server export config object
  module.exports = appConfig;
}
