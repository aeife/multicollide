'use strict';

var websocket = function(){
  var websocketApi = {
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
    multicollide: {
      start: {
        on: {},
        emit: {}
      },
      turn: {
        on: {}
      },
      changeDirection: {
        emit: {}
      }
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
        }
      },
      deleted: {
        on: {}
      },
      player: {
        joined: {
          on: {}
        },
        left: {
          on: {}
        }
      },
      started: {
        on: {}
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
      newLanguag: {
        emit: {}
      }
    }
  };

  function generateStringObject(obj){
    console.log('generate');
    Object.keys(obj).forEach(function(key) {
      var msg = '';
      iterate(obj[key], msg, key);
    });

    return obj;
  }

  function iterate(obj, msg, type) {
    console.log('iterate');
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === 'object' && !obj[property].opts && Object.keys(obj[property]).length !== 0) {
          // continue iterating till at the deepest level
          iterate(obj[property], msg ? msg + ':' + property : property, type);
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
  }

  return {api: websocketApi, generateStringObject: generateStringObject};
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = websocket;
} else {
  angular.module('websocketApi', [])
  .factory('websocketApi', websocket);
}

