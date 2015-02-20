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
                //TODO if token expire remove user profile
                //get storage
                var storage = Token.getStorage();

                //get profile storage key
                var profileStorageKey = Token.getProfileStorageKey();

                //grab user profile from the storage
                //see https://github.com/gsklee/ngStorage#read-and-write--demo
                return storage[profileStorageKey];
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

            //chech if user
            //has a given permission
            $user.hasPermission = function(checkPermission) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function
                var deferred = $q.defer();

                //grab user profile permissions
                var permissions = $user.getProfile().permissions;

                //if user profile
                //doesnt define any
                //permissions resolve to false
                if (!permissions) {
                    deferred.resolve(false);
                }

                //check if user permissions
                //array includes the
                //given permission
                else {
                    var hasPermission =
                        Utils.includes(permissions, checkPermission);

                    deferred.resolve(hasPermission);
                }

                return deferred.promise;
            };

            //check if user
            //has all provided permissions
            $user.hasPermissions = function(checkPermissions) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function
                var deferred = $q.defer();

                //grab user profile permissions
                var permissions = $user.getProfile().permissions;

                //if user profile
                //doesnt define any
                //permissions resolve to false
                if (!permissions) {
                    deferred.resolve(false);
                }

                //check if user permissions
                //array includes
                //all of given permission to check
                else {
                    var hasAllPermissions =
                        Utils.includesAll(permissions, checkPermissions);

                    deferred.resolve(hasAllPermissions);
                }

                return deferred.promise;
            };

            //check user if has any
            //provided permissions
            $user.hasAnyPermission = function(checkPermissions) {
                //make use of promise
                //so that this can be used
                //in controller and state resolve function
                var deferred = $q.defer();

                //grab user profile permissions
                var permissions = $user.getProfile().permissions;

                //if user profile
                //doesnt define any
                //permissions resolve to false
                if (!permissions) {
                    deferred.resolve(false);
                }

                //check if user permissions
                //array includes
                //any of given permission to check
                else {
                    var hasAnyPermission =
                        Utils.includesAny(permissions, checkPermissions);

                    deferred.resolve(hasAnyPermission);
                }

                return deferred.promise;
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