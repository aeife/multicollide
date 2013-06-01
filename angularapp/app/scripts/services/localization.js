'use strict';

angular.module('angularappApp')
  .factory('localization', function ($http) {
    // Service logic
    // ...

    // Public API here
    var localization = {
      language: 'en-US',
      localization: {},
      loaded: false,
      getAvailableLanguages: function() {
        return [
          {key: 'en-US', value: 'english'},
          {key: 'de-DE', value: 'german'}
        ];
      },
      getCurrentLanguage: function() {
        return this.language;
      },
      keys: {},
      getLocalizationKeys: function(){
        for (var k in this.localization) {
          this.keys[k] = k;
        }
        return this.keys;
      },
      changeLanguage: function(newLanguage) {
        this.language = newLanguage;

        // load new localization
        this.loadLocalization();
      },
      loadLocalization: function() {
        var self = this;
        $http.get('../../locale_' + this.language + '.json').success(function(data) {
          console.log('loaded localization');
          console.log(data);
          self.localization = data;
          self.loaded = true;
        });
      },
      getLocalizedValue: function(input, args) {
        var result = '';
        if (this.loaded) {
          result = this.localization[input].message;
          // input arguments
          if (args) {
            for (var i = 0; i < args.length; i++){
              result = result.replace('%'+(i+1), args[i]);
            }
          }
        }
        return result;
      }
    };

    // inital loading of localization
    localization.loadLocalization();
    return localization;
  });
