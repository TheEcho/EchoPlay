'use strict';

angular.module('EchoPlayApp',
    [
        'ngStorage',
        'ngRoute',
        'angularFileUpload',
        "ngSanitize",
        'ngTable',
        'ngMaterial',
        'com.2fdevs.videogular',
        'com.2fdevs.videogular.plugins.controls',
        'com.2fdevs.videogular.plugins.overlayplay',
        'com.2fdevs.videogular.plugins.poster'
    ])

    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'templates/home.html',
                controller: 'MainCtrl'
            }).
            when('/play', {
                templateUrl: 'templates/play.html',
                controller: 'MainCtrl'
            }).
            when('/upload', {
                templateUrl: 'templates/upload.html',
                controller: 'MainCtrl'
            }).
            when('/signin', {
                templateUrl: 'templates/signin.html',
                controller: 'MainCtrl'
            }).
            when('/signup', {
                templateUrl: 'templates/signup.html',
                controller: 'MainCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
                return {
                    'request': function (config) {
                        config.headers = config.headers || {};
                        if ($localStorage.token) {
                            config.headers.Authorization = 'Cr3awav3 ' + $localStorage.token;
                        }
                        return config;
                    },
                    'responseError': function(response) {
                        if (response.status === 401 || response.status === 403) {
                            console.log(response.data);
                            $location.path('/signin');
                        }
                        return $q.reject(response);
                    }
                };
            }]);
        }
    ])
