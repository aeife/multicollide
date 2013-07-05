'use strict';

angular.module('angularappApp', ['ngResource', 'ngCookies', 'angularappAppBoot', 'ui.bootstrap', 'placeholders'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/user/:name', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl'
      })
      .when('/404', {
        templateUrl: 'views/error.html',
        controller: 'ErrorCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/games', {
        templateUrl: 'views/games.html',
        controller: 'GamesCtrl'
      })
      .when('/blog', {
        templateUrl: 'views/blog.html',
        controller: 'BlogCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .otherwise({
        redirectTo: '/404'
      });
  });


angular.module('angularappAppBoot', []).

  run(function(localization, $templateCache, $http, imagePreload, socketApi, $cookies) { // instance-injector
    // initialize localization service
    // reason: user controller needs localization keys for pluralize
    // when direct accessing user route localization is not loaded before

    // load server shutdown template so it can be shown once the server is offline
    $http.get('views/msgServerOffline.html', { cache: $templateCache }).then(function (response) {
    });

    imagePreload.preload(['images/error.png']);

    // check login status on start up
    // @TODO: Case that client has no cookie but still is logged in on the server
    socketApi.checkLoginStatus(function(data){
      if (data.username != $cookies.username){
        console.log("not logged in anymore!");
        // $cookies = {};
        delete $cookies.username;
        delete $cookies.loggedin;
      } else {
        console.log("still logged in!");
      }
    });
  });
