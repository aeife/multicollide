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
  return websocketApi;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = websocket;
} else {
  angular.module('websocketApi', [])
  .factory('websocketApi', websocket);
}

