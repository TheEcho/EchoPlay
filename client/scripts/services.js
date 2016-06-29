'use strict';

var baseUrl = "http://echo-play:8080";

angular.module('EchoPlayApp')
    .factory('Main', ['$http', '$localStorage', function($http, $localStorage){
        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            save: function(data, success, error) {
                $http.post(baseUrl + '/signin', data).success(success).error(error);
            },
            signin: function(data, success, error) {
                $http.post(baseUrl + '/authenticate', data).success(success).error(error);
            },
            profil: function(success, error) {
                $http.get(baseUrl + '/home').success(success).error(error);
            },
            deleteAll: function(success, error) {
                $http.get(baseUrl + '/delete').success(success).error(error);
            },
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                success();
            }
        };
    }])
