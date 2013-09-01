'use strict';

angular.module('localization', [])
  .factory('localization', function ($http, $cookies, tmhDynamicLocale) {
    // Service logic
    // ...

    // Public API here
    var localization = {
      language: $cookies.language? $cookies.language : 'en-US',
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
      getLanguageValueForKey: function(key){
        var languages = this.getAvailableLanguages();
        for (var i = 0; i < languages.length; i++){
          if (languages[i].key === key){
            return languages[i].value;
          }
        }
      },
      changeLanguage: function(newLanguage) {
        this.language = newLanguage;
        tmhDynamicLocale.set(newLanguage);

        // set cookie to new language, if english just delete
        if (newLanguage == 'en-US' && $cookies.language){
          delete $cookies.language;
        } else {
          $cookies.language = newLanguage;
        }

        // load new localization
        this.loadLocalization();
      },
      loadLocalization: function() {
        var self = this;
        this.localization = {};
        $http.get('../../locale_' + this.language + '.json').success(function(data) {
          console.log('loaded localization');
          console.log(data);
          angular.extend(self.localization, data);
          self.loaded = true;
        });

        for (var i = 0; i < appConfig.games.length; i++){
          if (appConfig.games[i].locale && appConfig.games[i].locale[this.language]){
            $http.get(appConfig.games[i].locale[this.language]).success(function(data) {
              console.log('loaded GAME SPECIFIC localization');
              console.log(data);
              angular.extend(self.localization, data);
              self.loaded = true;
            });
          }
        }
      },
      getLocalizedValue: function(input, args) {
        var result = '';
        if (this.loaded) {

          //if no translation available print the placeholder
          if (!this.localization[input]){
            return input;
          }

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
    tmhDynamicLocale.set(localization.language);
    return localization;
  })
  .filter('i18n', function (localization) {
    return function (input, args) {
      return localization.getLocalizedValue(input, args);
    };
  });
