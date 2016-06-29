'use strict';

/* Controllers */

angular.module('EchoPlayApp')
    .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$route', 'Main', function($rootScope, $scope, $location, $localStorage, $route, Main) {
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
                firstPassword: $scope.firstPassword,
                secondPassword: $scope.secondPassword,
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

        $scope.home = function() {
            Main.home(function(res) {
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

    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', 'NgTableParams', 'Main', function($rootScope, $scope, $location, NgTableParams, Main) {
        Main.home(function(res) {
            $scope.data = [];
            $scope.userid = res.userid;
            for (var i = 0; i < res.data.length; i ++) {
                var file = {
                    id: res.data[i]._id,
                    title: res.data[i].name,
                    url: '/media/' + res.userid + '/' + res.data[i].name,
                };
                $scope.data.push(file);
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

        $scope.deleteFile = function (file) {
            Main.delete(file.name, function (res) {

            }, function () {

            });
        }
    }])


        .controller('MediaCtrl', ['$sce', function($sce) {
            this.config = {
    			sources: [
    				{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"},
    				{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
    				{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
    			],
    			tracks: [
    				{
    					src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
    					kind: "subtitles",
    					srclang: "en",
    					label: "English",
    					default: ""
    				}
    			],
    			theme: "lib/videogular-themes-default/videogular.css",
    			plugins: {
    				poster: "http://www.videogular.com/assets/images/videogular.png"
    			}
    		};
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
