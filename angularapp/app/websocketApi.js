'use strict';

(function(){
  var websocket = {
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
            attach: 'username'
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
    generateServerObject: function(obj){
      var self = this;
      console.log('generate');
      var msg = '';
      self.iterate(obj, msg);

      return obj;
    },
    iterate: function(obj, msg, type){
      var self = this;
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == 'object' && !obj[property].emit && !obj[property].get && !obj[property].on && Object.keys(obj[property]).length != 0) {
            // continue iterating till at the deepest message level
            self.iterate(obj[property], msg ? msg + ':' + property : property);
          } else {
            // process found end attribute
            var message = msg ? msg + ':' + property : property;
            console.log(message);
            console.log(obj[property]);
            // attach message string to object or generate attach function to construct message at runtime
            if ((obj[property].get && obj[property].get.attach) ||
                (obj[property].on && obj[property].on.attach) ||
                (obj[property].emit && obj[property].emit.attach)) {

              obj[property] = generateAttachFunction(message);
            } else {
              obj[property] = message;
            }
          }
        }
      }
    },
    appendGameApis: function(config){
      // add config apis
      var websocketApi;
      for (var i = 0; i < config.games.length; i++){
        websocketApi = concatObj(this.api, config.games[i].api);
      }
      return websocketApi;
    }
  };

  function concatObj(obj1, obj2){
    for (var attrname in obj2){
      obj1[attrname] = obj2[attrname];
    }

    return obj1;
  }

  function generateAttachFunction(msg){
    return function(param){
      if (param){
        return msg + ':' + param;
      } else {
        return msg;
      }

    };
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = websocket;
  } else {
    angular.module('websocketApi', [])
    .factory('websocketApi', function(){
      return websocket;
    });
  }

})();
