'use strict';

var appConfig = {
  api: {
    onlinestatus: {
      on: {
        attach: 'username',
        onlyForListeners: true
      }
    },
    successfullConnected: {
      on: {}
    },
    disconnect: {
      on: {}
    },
    users: {
      connected: {
        get: {}
      },
      all: {
        get: {}
      }
    },
    user: {
      new: {
        get: {
          emitData: ['username', 'password', 'email']
        }
      },
      login: {
        get: {
          emitData: ['username', 'password']
        }
      },
      logout: {
        get: {}
      },
      info: {
        get: {
          emitData: 'name',
          attach: 'name'
        }
      },
      statsUpdate: {
        on: {
          attach: 'username',
          onlyForListeners: true
        }
      }
    },
    games: {
      get: {}
    },
    lobby: {
      new: {
        get: {
          emitData: ['lobbyName', 'playerLimit']
        }
      },
      join: {
        get: {
          emitData: 'id'
        }
      },
      leave: {
        get: {
          emitData: 'id'
        },
        on: {}
      },
      start: {
        get: {
          emitData: 'id'
        },
        on: {}
      },
      player: {
        joined: {
          on: {}
        },
        left: {
          on: {}
        }
      }
    },
    friend: {
      add: {
        get: {
          emitData: 'username'
        }
      },
      remove: {
        get: {
          emitData: 'username'
        }
      },
      accept: {
        emit: {}
      },
      decline: {
        emit: {}
      },
      request: {
        on: {}
      },
      new: {
        on: {}
      },
      deleted: {
        on: {}
      }
    },
    friends: {
      all: {
        get: {}
      }
    },
    settings: {
      changePassword: {
        get: {
          emitData: ['username', 'oldPassword', 'newPassword']
        }
      },
      newLanguage: {
        emit: {}
      }
    },
    chat: {
      join: {
        get: {}
      },
      user: {
        joined: {
          on: {}
        },
        left: {
          on: {}
        }
      },
      leave: {
        get: {}
      },
      message: {
        emit: {},
        on: {}
      }
    }
  },
  combinedApi: function(){
    var combined = [];
    combined.push(this.api);

    for (var i = 0; i < this.games.length; i++){
      combined.push(this.games[i].api);
    }

    return combined;
  },
  games: [
    {
      name: 'multicollide',
      description: {
        'en-US': 'A super awesome multiplayer game.',
        'de-DE': 'Ein super tolles Multiplayerspiel.'
      },
      locale: {
        'en-US': 'scripts/multicollide/locale_en-US.json',
        'de-DE': 'scripts/multicollide/locale_de-DE.json'
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
      helpPage: 'scripts/multicollide/help.html'
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
