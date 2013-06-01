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
      changeLanguage: function(newLanguage) {
        this.language = newLanguage;

        // load new localization
        this.loadLocalization();
      },
      loadLocalization: function() {
        console.log('LOADING!!');
        var self = this;
        $http.get('../../locale_' + this.language + '.json').success(function(data) {
          console.log('loaded localization');
          console.log(data);
          self.localization = data;
          self.loaded = true;
        });
      },
      getLocalizedValue: function(input) {
        var result = '';
        console.log('getting localized value');
        console.log(this.loaded);
        console.log(this.localization);
        if (this.loaded) {
          result = this.localization[input].value;
        }
        return result;
      }
    };

    // inital loading of localization
    localization.loadLocalization();
    return localization;
  });
