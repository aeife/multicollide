websocket = function(){
  var websocketApi = {
    on: {
      onlinestatus: {
        opts: {
          attach: "username"
        }
      },
      friend: {
        request: {},
        new: {},
        deleted: {}
      },
      lobby: {
        deleted: {},
        player: {
          joined: {},
          left: {}
        }
      },
      successfullConnected: {},
      disconnect: {}
    },
    get: {
      users: {
        connected: {},
        all: {}
      },
      user: {
        new: {
          opts: {
            emitData: ["username", "password", "email"]
          }
        },
        login: {
          opts: {
            emitData: ["username", "password"]
          }
        },
        logout: {},
        info: {
          opts: {
            emitData: "name",
            attach: "name"
          }
        }
      },
      games: {},
      lobby: {
        new: {},
        join: {
          opts: {
            emitData: "id"
          }
        },
        leave: {
          opts: {
            emitData: "id"
          }
        }
      },
      friend: {
        add: {
          opts: {
            emitData: "username"
          }
        },
        remove: {
          opts: {
            emitData: "username"
          }
        }
      },
      friends: {
        all: {}
      },
      settings: {
        changePassword: {
          opts: {
            emitData: ["username", "oldPassword", "newPassword"]
          }
        }
      }
    },
    emit: {
      friend: {
        accept: {},
        decline: {}
      },
      settings: {
        newLanguage: {}
      }
    }
  }

  function generateStringObject(obj){
    console.log("generate");
    Object.keys(obj).forEach(function(key) {
      var msg = "";
      iterate(obj[key], msg, key);
    });

    return obj;
  }

  function iterate(obj, msg, type) {
    console.log("iterate");
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] == "object" && !obj[property].opts && Object.keys(obj[property]).length != 0) {
          // continue iterating till at the deepest level
          iterate(obj[property], msg ? msg + ":" + property : property, type);
        } else {
          // process found end attribute
          var m = msg ? msg + ":" + property : property;
          console.log("---");
          console.log(obj[property]);
          console.log(m);
          obj[property].msgkey = m;
        }
      }
    }
  }

  return {api: websocketApi, generateStringObject: generateStringObject};
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = websocket;
} else {
  angular.module('websocketApi', [])
  .factory('websocketApi', websocket);
}

