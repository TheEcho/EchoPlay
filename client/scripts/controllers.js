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
            });
        };

        $scope.home = function() {
            Main.home(function(res) {
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            });
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

    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$route', 'NgTableParams', 'Main', function($rootScope, $scope, $location, $route, NgTableParams, Main) {
        Main.home(function(res) {
            $scope.data = [];
            $scope.userid = res.userid;
            for (var i = 0; i < res.data.length; i ++) {
                var file = {
                    id: res.data[i]._id,
                    name: res.data[i].name,
                    ext: res.data[i].ext,
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

        $scope.playFile = function (file) {
            $rootScope.currentFile = file;
            $location.path('/play');
        }

        $scope.deleteFile = function (file) {
            var formData = {
                id: file.id,
                name: file.name
            }

            Main.delete(formData, function (res) {
                var index = _.indexOf($scope.data, file);
                $scope.data.splice(index, 1);
                $scope.tableParams.reload();
            }, function () {
                $rootScope.error = 'Failed to delete';
            });
        }
    }])

    .controller('MediaCtrl', ['$sce', '$rootScope', function($sce, $rootScope) {
        this.currentFile = $rootScope.currentFile;
        console.log(this.currentFile);
        this.config = {
			sources: [
				{src: $sce.trustAsResourceUrl(this.currentFile.url), type: "video/" + this.currentFile.ext}
			],
			tracks: [],
			theme: "lib/videogular-themes-default/videogular.css",
			plugins: {
				poster: "http://www.videogular.com/assets/images/videogular.png"
			}
		};
    }])

    .controller('UploadCtrl', ['$scope', '$localStorage', '$route', 'NgTableParams', 'Main', 'FileUploader', function($scope, $localStorage, $route, NgTableParams, Main, FileUploader) {

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
