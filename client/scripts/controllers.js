'use strict';

/* Controllers */

angular.module('corpusRecorderApp')
    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$route', 'Main', function($rootScope, $scope, $location, $localStorage, $route, Main) {
        if ($localStorage.token) $rootScope.isLogged = true;
        else $rootScope.isLogged = false;

        $scope.signin = function() {
            var formData = {
                mail: $scope.mail,
                password: $scope.password
            }

            Main.signin(formData, function(res) {
                $rootScope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
            }, function() {
                $rootScope.error = 'Failed to signin';
            });
        };

        $scope.signup = function() {
            var formData = {
                mail: $scope.mail,
                password: $scope.password,
                firstname: $scope.firstname,
                lastname: $scope.lastname
            }

            Main.save(formData, function(res) {
                $rootScope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
            }, function() {
                $rootScope.error = 'Failed to signup';
            })
        };

        $scope.profil = function() {
            Main.profil(function(res) {
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            })
        };

        $scope.logout = function() {
            Main.logout(function() {
                $rootScope.isLogged = false;
                $location.path('/');
                $route.reload();
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
    }])

    .controller('ProfilCtrl', ['$rootScope', '$scope', '$location', 'NgTableParams', 'Main', function($rootScope, $scope, $location, NgTableParams, Main) {
        initRecorder();
        $scope.timeLimit = 60;

        Main.profil(function(res) {
            $scope.data = [];
            $scope.userid = res.userid;
            for (var i = 0; i < res.data.length; i ++) {
                var track = {
                    id: res.data[i]._id,
                    title: res.data[i].name,
                    url: '/media/' + res.userid + '/' + res.data[i].name,
                };
                $scope.data.push(track);
            }
            $scope.tableParams = new NgTableParams({
                count: 20
            }, {
                counts: [],
                dataset: $scope.data
            });
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        });

        $scope.playOriginalTrack = function (track) {
            isPlaying ? stopPlaying() : startPlaying(track, function() {}, function() {});
        }
    }])

    .controller('UploadCtrl', ['$scope', '$localStorage', '$route', 'NgTableParams', 'Main', 'FileUploader', function($scope, $localStorage, $route, NgTableParams, Main, FileUploader) {

        $scope.deleteAllFile = function () {
            Main.deleteAll(function () {$route.reload();}, function () {});
        }

        var uploader = $scope.uploader = new FileUploader({
            headers : {
                Authorization: 'EchoPlay ' + $localStorage.token
            },
            url: '/upload'
        });

        uploader.onAfterAddingFile = function(fileItem) {
            $scope.data = uploader.queue;
            $scope.tableParams = new NgTableParams({
                count: 20
            }, {
                counts: [],
                dataset: $scope.data
            });
        };
    }]);
