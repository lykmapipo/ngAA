(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.providers:Auth
     * @description ngAA authentication service provider
     */
    angular
        .module('ngAA')
        .provider('$auth', function(ngAAConfig) {
            //reference to provider context
            var self = this;

            //extend $authProvider with ability to set
            //and get ngAA configurations

            //grab configurations keys
            var configKeys = Object.keys(ngAAConfig);

            //provide configuration 
            //setter and getters
            angular
                .forEach(configKeys, function(configKey) {
                    Object.defineProperty(self, configKey, {
                        get: function() {
                            return ngAAConfig[configKey];
                        },
                        set: function(value) {
                            ngAAConfig[configKey] = value;
                        }
                    });
                });

            //$auth service factory fuction
            self.$get = function(Token, User) {
                var $auth = {};

                $auth.signin = function(user) {
                    return User.signin(user);
                };


                $auth.signout = function() {
                    return User.logout();
                };

                $auth.isAuthenticated = function() {
                    return User.isAuthenticated();
                };

                $auth.getClaim = function() {
                    return Token.getClaim();
                };

                $auth.getProfile = function() {
                    return User.getProfile();
                };

                
                $auth.hasPermission = function(permission) {
                    return User.hasPermission(permission);
                };

                $auth.hasPermissions = function(checkPermissions) {
                    return User.hasPermissions(checkPermissions);
                };

                $auth.hasAnyPermission = function(checkPermissions) {
                    return User.hasAnyPermission(checkPermissions);
                };

                return $auth;
            };
        });

}());