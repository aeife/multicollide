'use strict';

angular.module('angularappApp',
  ['ngResource',
  'ngCookies',
  'ui.bootstrap',
  'placeholders.img',
  'placeholders.txt',
  'main',
  'menu',
  'friendslist',
  'settings',
  'about',
  'blog',
  'error',
  'login',
  'signup',
  'flash',
  'localization',
  'sockets',
  'filters',
  'profileBox',
  'imagePreload',
  'profile',
  'games',
  'websocketApi',
  'multicollide',
  'STATES'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'scripts/main/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'scripts/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'scripts/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/profile/:name', {
        templateUrl: 'scripts/profile/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/404', {
        templateUrl: 'scripts/error/error.html',
        controller: 'ErrorCtrl'
      })
      .when('/about', {
        templateUrl: 'scripts/about/about.html',
        controller: 'AboutCtrl'
      })
      .when('/games', {
        templateUrl: 'scripts/games/games.html',
        controller: 'GamesCtrl'
      })
      .when('/blog', {
        templateUrl: 'scripts/blog/blog.html',
        controller: 'BlogCtrl'
      })
      .when('/settings', {
        templateUrl: 'scripts/settings/settings.html',
        controller: 'SettingsCtrl'
      })
      .otherwise({
        redirectTo: '/404'
      });
  });


angular.module('angularappAppBoot', ['angularappApp']).

  run(function(localization, $templateCache, $http, imagePreload, socketgenapi, $cookies, $rootScope) { // instance-injector
    // initialize localization service
    // reason: user controller needs localization keys for pluralize
    // when direct accessing user route localization is not loaded before

    // load server shutdown template so it can be shown once the server is offline
    $http.get('views/msgServerOffline.html', { cache: $templateCache }).then(function (response) {
    });

    imagePreload.preload(['images/error.png']);

    // check login status on start up
    // @TODO: Case that client has no cookie but still is logged in on the server
    // @TODO: Check if language is still account language on reconnect and logged in
    socketgenapi.successfullConnected.on(function(data){

      // @TODO: is not loaded before when directly opening route #/games
      $rootScope.username = data.username;
      if (data.username !== $cookies.username){
        console.log('not logged in anymore!');
        // $cookies = {};
        delete $cookies.username;
        delete $cookies.loggedin;
      } else {
        console.log('still logged in!');
      }
    }).once();


  });
