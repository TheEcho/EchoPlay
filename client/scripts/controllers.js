'use strict';

/* Controllers */

angular.module('EchoPlayApp')
    .controller('MainCtrl', ['$rootScope', '$location', '$localStorage', '$route', 'Main', function($rootScope, $location, $localStorage, $route, Main) {
        var self = this;

        self.home           = home;
        self.signin         = signin;
        self.signup         = signup;
        self.logout         = logout;
        $rootScope.isLogged = $localStorage.token ? true : false;

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
                $rootScope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
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
                $rootScope.isLogged = true;
                $localStorage.token = res.token;
                $location.path('/');
            }, function() {
                $rootScope.error = 'Failed to signup';
            });
        };

        function logout() {
            Main.logout(function() {
                $rootScope.isLogged = false;
                $location.path('/');
                $route.reload();
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
    }])

    .controller('HomeCtrl', ['$rootScope', '$mdSidenav', '$location', '$route', 'Main', function($rootScope, $mdSidenav, $location, $route, Main) {
        var self = this;

        self.selectedType  = null;
        self.selectedFile  = null;
        self.files         = [ ];
        self.types         = [
            {name: 'Tous les fichier', icon: 'icon-folder'},
            {name: 'Vidéo', icon: 'icon-movie'},
            {name: 'Audio', icon: 'icon-music_note'},
            {name: 'Image', icon: 'icon-image'}
        ]
        self.user          = null;
        self.selectFile    = selectFile;
        self.toggleSidebar = toggleSideList;
        self.playFile      = playFile;
        self.deleteFile    = deleteFile;

        Main.home(function(res) {
            self.user = res.userid;
            for (var i = 0; i < res.data.length; i ++) {
                var file = {
                    id: res.data[i]._id,
                    name: res.data[i].name,
                    ext: res.data[i].ext,
                    url: '/media/' + self.user + '/' + res.data[i].name,
                    icon: 'icon-image'
                };
                self.files.push(file);
            }
            self.selected = self.files[0];
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        });

        function toggleSideList() {
          $mdSidenav('left').toggle();
        }

        function selectType (type) {
          self.selected = angular.isNumber(type) ? self.types[type] : type;
        }

        function selectFile (file) {
          self.selected = angular.isNumber(file) ? self.files[file] : file;
        }

        function playFile (file) {
            $rootScope.currentFile = file;
            $location.path('/play');
        }

        function deleteFile (file) {
            var formData = {
                id: file.id,
                name: file.name
            }

            Main.delete(formData, function (res) {
            }, function () {
                $rootScope.error = 'Failed to delete';
            });
        }
    }])

    .controller('MediaCtrl', ['$sce', '$rootScope', '$location', function($sce, $rootScope, $location) {
        var self = this;

        if (!$rootScope.currentFile) {
            $location.path('/');
        } else {
            self.currentFile = $rootScope.currentFile;
            $rootScope.currentFile = null;
            self.config = {
    			sources: [
    				{src: $sce.trustAsResourceUrl(self.currentFile.url), type: "video/" + self.currentFile.ext}
    			],
    			tracks: [],
    			theme: "lib/videogular-themes-default/videogular.css",
    		};
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
