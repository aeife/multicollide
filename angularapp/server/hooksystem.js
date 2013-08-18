'use strict';

module.exports = {
  hooks: {},
  registerHook: function(moduleName, hookName){
    this.hooks[moduleName] = {};
    this.hooks[moduleName][hookName] = [];
  },
  addHook: function(hook, functionToHook){
    hook.push(functionToHook);
  },
  includeHook: function(hook, params){
    if (hook.length > 0){
      for (var i = 0; i < hook.length; i++){
        hook[i](params);
      }
    }
  }
};
