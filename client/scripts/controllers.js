'use strict';

/* Controllers */

angular.module('EchoPlayApp')
    .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$route', 'Main', function($rootScope, $scope, $location, $localStorage, $route, Main) {
        var self = this;

        self.home           = home;
        self.signin         = signin;
        self.signup         = signup;
        self.logout         = logout;
        $scope.isLogged     = $localStorage.token ? true : false;

        function home() {
            Main.home(function(res) {
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            });
        };

        function signin() {
            var formData = {
                mail: self.mail,
                password: self.password
            }

            Main.signin(formData, function(res) {
                $scope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
                $route.reload();
            }, function() {
                $rootScope.error = 'Failed to signin';
            });
        };

        function signup() {
            var formData = {
                mail: self.mail,
                firstPassword: self.firstPassword,
                secondPassword: self.secondPassword,
                firstname: self.firstname,
                lastname: self.lastname
            }

            Main.save(formData, function(res) {
                $scope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
                $route.reload();
            }, function() {
                $rootScope.error = 'Failed to signup';
            });
        };

        function logout() {
            Main.logout(function() {
                $scope.isLogged = false;
                $location.path('/');
                $route.reload();
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
    }])

    .controller('HomeCtrl', ['$rootScope', '$mdDialog', '$mdSidenav', '$location', '$route', '$sce', 'Main', function($rootScope, $mdDialog, $mdSidenav, $location, $route, $sce, Main) {
        var self = this;

        self.files         = [ ];
        self.types         = [
            {name: 'All Files', icon: 'insert_drive_file'},
            {name: 'Video', icon: 'movie'},
            {name: 'Audio', icon: 'music_note'},
            {name: 'Image', icon: 'image'}
        ];
        self.user          = null;
        self.selectedType  = self.types[0];
        self.playFile      = playFile;
        self.selectType    = selectType;
        self.deleteFile    = deleteFile;

        Main.home(function(res) {
            self.user = res.userid;
            for (var i = 0; i < res.data.length; i ++) {
                var file = {
                    id: res.data[i]._id,
                    name: res.data[i].name,
                    ext: res.data[i].ext,
                    url: '/media/' + self.user + '/' + res.data[i].name,
                    icon: res.data[i].icon
                };
                self.files.push(file);
            }
            if (self.files.length > 0) {
                self.selectedFile = self.files[0];
            }
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        });

        function selectType (type) {
            self.selectedType = type;
            Main.home(function(res) {
                self.files = [ ];
                self.user = res.userid;
                for (var i = 0; i < res.data.length; i ++) {
                    var file = {
                        id: res.data[i]._id,
                        name: res.data[i].name,
                        ext: res.data[i].ext,
                        url: '/media/' + self.user + '/' + res.data[i].name,
                        icon: res.data[i].icon
                    };
                    if (type.icon == 'insert_drive_file' || file.icon == type.icon) {
                        self.files.push(file);
                    }
                }
                if (self.files.length > 0) {
                    self.selectedFile = self.files[0];
                }
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            });
        }

        function playFile (ev, file) {
            if (file.icon == 'movie') {
                var ctrl = movieCtrl;
                var template = 'templates/play_movie.html';
            } else if (file.icon == 'music_note') {
                var ctrl = musicCtrl;
                var template = 'templates/play_music.html';
            } else if (file.icon == 'image') {
                var ctrl = imageCtrl;
                var template = 'templates/play_image.html';
            } else {
                return;
            }
            $rootScope.File = file;
            $mdDialog.show({
                controller: ctrl,
                templateUrl: template,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

        function deleteFile (file) {
            var formData = {
                id: file.id,
                name: file.name
            }

            Main.delete(formData, function (res) {
                $route.reload();
            }, function () {
                $rootScope.error = 'Failed to delete';
            });
        }
    }])

    .controller('UploadCtrl', ['$localStorage', '$route', 'Main', 'FileUploader', function($localStorage, $route, Main, FileUploader) {
        var self = this;

        var uploader = self.uploader = new FileUploader({
            headers : {
                Authorization: 'EchoPlay ' + $localStorage.token
            },
            url: '/upload'
        });

        uploader.onAfterAddingFile = function(fileItem) {
            self.files = uploader.queue;
        };
    }]);

    function movieCtrl($rootScope, $sce, $scope) {
        $scope.media = {
            sources: [
                {src: $sce.trustAsResourceUrl($rootScope.File.url), type: "video/" + $rootScope.File.ext}
            ],
            tracks: [],
            theme: "lib/videogular-themes-default/videogular.css",
            plugins: {
				poster: "http://www.videogular.com/assets/images/videogular.png"
			}
        };
    }

    function musicCtrl($rootScope, $sce, $scope) {
        $scope.media = {
            sources: [
                {src: $sce.trustAsResourceUrl($rootScope.File.url), type: "audio/" + $rootScope.File.ext}
            ],
            tracks: [],
            theme: "lib/videogular-themes-default/videogular.css",
            plugins: {
				poster: "http://www.videogular.com/assets/images/videogular.png"
			}
        };
    }

    function imageCtrl($rootScope, $scope) {
        $scope.imageUrl = $rootScope.File.url;
    }
