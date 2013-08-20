'use strict';

(function(){
  var websocket = {
    api: {
      onlinestatus: {
        on: {
          attach: 'username'
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
      }
    },
    generateStringObject: function(obj){
      var self = this;
      console.log('generate');
      Object.keys(obj).forEach(function(key) {
        var msg = '';
        self.iterate(obj[key], msg, key);
      });

      return obj;
    },
    iterate: function(obj, msg, type){
      var self = this;
      console.log('iterate');
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] === 'object' && !obj[property].opts && Object.keys(obj[property]).length !== 0) {
            // continue iterating till at the deepest level
            self.iterate(obj[property], msg ? msg + ':' + property : property, type);
          } else {
            // process found end attribute
            var m = msg ? msg + ':' + property : property;
            console.log('---');
            console.log(obj[property]);
            console.log(m);
            obj[property].msgkey = m;
          }
        }
      }
    },
    appendGameApis: function(config){
      // add config apis
      var websocketApi;
      for (var i = 0; i < config.games.length; i++){
        // console.lg()
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


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = websocket;
  } else {
    angular.module('websocketApi', [])
    .factory('websocketApi', function(){
      return websocket;
    });
  }

})();
