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

