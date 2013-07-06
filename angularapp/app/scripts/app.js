'use strict';

angular.module('angularappApp', ['ngResource', 'ngCookies', 'ui.bootstrap', 'placeholders', 'main', 'menu', 'friendslist', 'settings', 'about', 'blog', 'error', 'login', 'signup', 'flash'])
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
      .when('/user/:name', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl'
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
        templateUrl: 'views/games.html',
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
