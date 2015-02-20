(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAA.User
     * @description
     * # User
     * Factory in the ngAA.
     */
    angular
        .module('ngAA')
        .factory('User', function($q, $location, $http, Token, ngAAConfig, Utils) {
            var $user = {};

            //store user profile 
            //into storage
            $user.setProfile = function(response) {
                //grab profile storage key
                var profileStorageKey = Token.getProfileStorageKey();

                //deduce user profile from
                //the response
                //using profileKey configuration
                var profile = response.data[ngAAConfig.profileKey];

                //if no user profile found in 
                //above procedures
                if (!profile) {
                    throw new Error('Unknown response format: ' + JSON.stringify(response.data));
                }

                //grab storage to use
                var storage = Token.getStorage();

                //store user profile
                //see https://github.com/gsklee/ngStorage#read-and-write--demo
                storage[profileStorageKey] = profile;
            };


            //get user profile from storage
            $user.getProfile = function() {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function
                var deferred = $q.defer();

                //get storage
                var storage = Token.getStorage();

                //get profile storage key
                var profileStorageKey = Token.getProfileStorageKey();

                //grab user profile from the storage
                //see https://github.com/gsklee/ngStorage#read-and-write--demo
                var profile = storage[profileStorageKey];

                //return user profile
                deferred.resolve(profile);

                return deferred.promise;
            };

            //check if current 
            //user is authenticated
            $user.isAuthenticated = function() {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function
                var deferred = $q.defer();

                //user is authenticated
                //he/she has a token 
                //and it is not expired
                var authenticated =
                    Token.isTokenExpired();

                //return user authentication status
                deferred.resolve(!authenticated);

                return deferred.promise;

            };

            //check if user is
            //authetnicated synchronous
            $user.isAuthenticatedSync = function() {
                //user is authenticated
                //he/she has a token 
                //and it is not expired
                var authenticated =
                    Token.isTokenExpired();

                return !authenticated;
            };

            //chech if user
            //has a given permission
            $user.hasPermission = function(checkPermission) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function

                //grab user profile
                return $user
                    .getProfile()
                    .then(function(profile) {
                        //if there is no profile
                        //user no permission
                        if (!profile) {
                            return false;
                        }

                        //grab user profile permissions
                        var permissions = profile.permissions;
                        //if user profile
                        //doesnt define any
                        //permissions resolve to false
                        if (!permissions) {
                            return false;
                        }

                        //check if user permissions
                        //array includes the
                        //given permission
                        var hasPermission =
                            Utils.includes(permissions, checkPermission);

                        return hasPermission;
                    });
            };

            //check if user
            //has all provided permissions
            $user.hasPermissions = function(checkPermissions) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function

                return $user
                    .getProfile()
                    .then(function(profile) {
                        //if there is no profile
                        //user no permission
                        if (!profile) {
                            return false;
                        }

                        //grab user profile permissions
                        var permissions = profile.permissions;

                        //if user profile
                        //doesnt define any
                        //permissions resolve to false
                        if (!permissions) {
                            return false;
                        }

                        //check if user permissions
                        //array includes
                        //all of given permission to check
                        var hasAllPermissions =
                            Utils.includesAll(permissions, checkPermissions);
                        return hasAllPermissions;
                    });

            };

            //check user if has any
            //provided permissions
            $user.hasAnyPermission = function(checkPermissions) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function

                return $user
                    .getProfile()
                    .then(function(profile) {
                        //if there is no profile
                        //user no permission
                        if (!profile) {
                            return false;
                        }

                        //grab user profile permissions
                        var permissions = profile.permissions;

                        //if user profile
                        //doesnt define any
                        //permissions resolve to false
                        if (!permissions) {
                            return false;
                        }

                        //check if user permissions
                        //array includes
                        //any of given permission to check
                        var hasAnyPermission =
                            Utils.includesAny(permissions, checkPermissions);

                        return hasAnyPermission;
                    });
            };

            //signout current login user
            $user.signout = function() {
                //remove token and user 
                //profile from storage
                Token.removeToken();

                //promisify signout
                return $q.when();
            };

            //signin user
            //using backend api
            $user.signin = function(user) {
                return $http
                    .post(ngAAConfig.signinUrl, user)
                    .then(function(response) {
                        //store token
                        Token.setToken(response);

                        //store user profile
                        $user.setProfile(response);

                        return response;
                    });
            };

            return $user;
        });

}());