'use strict';

angular.module('corpusRecorderApp', ['ngStorage','ngRoute', 'angularSoundManager', 'angularAudioRecorder', 'angularFileUpload', 'ngTable'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).
            when('/uploadfile', {
                templateUrl: 'templates/upload.html',
                controller: 'HomeCtrl'
            }).
            when('/signin', {
                templateUrl: 'templates/signin.html',
                controller: 'HomeCtrl'
            }).
            when('/signup', {
                templateUrl: 'templates/signup.html',
                controller: 'HomeCtrl'
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
                            $location.path('/signin');
                        }
                        return $q.reject(response);
                    }
                };
            }]);
        }
    ])

    .config(function (recorderServiceProvider) {
        recorderServiceProvider
        .forceSwf(false)
        .withMp3Conversion(true);
    });
