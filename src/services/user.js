(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAAUser
     * @description user management service
     */
    angular
        .module('ngAA')
        .factory('ngAAUser', function($q, $http, ngAAToken, ngAAConfig, ngAAUtils) {
            var $user = {};

            //store user profile 
            //into storage
            $user.setProfile = function(response) {
                //grab profile storage key
                var profileStorageKey = ngAAToken.getProfileStorageKey();

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
                var storage = ngAAToken.getStorage();

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
                var storage = ngAAToken.getStorage();

                //get profile storage key
                var profileStorageKey = ngAAToken.getProfileStorageKey();

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
                    ngAAToken.isTokenExpired();

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
                    ngAAToken.isTokenExpired();

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
                            ngAAUtils.includes(permissions, checkPermission);

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
                            ngAAUtils.includesAll(permissions, checkPermissions);
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
                            ngAAUtils.includesAny(permissions, checkPermissions);

                        return hasAnyPermission;
                    });
            };

            //signout current login user
            $user.signout = function() {
                //remove token and user 
                //profile from storage
                ngAAToken.removeToken();

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
                        ngAAToken.setToken(response);

                        //store user profile
                        $user.setProfile(response);

                        return response;
                    });
            };

            //check user permits
            //based on state permits
            //definition
            $user.checkPermits = function(permits) {
                //check with only permission
                var withOnly = permits.withOnly || undefined;

                //check with all permissions
                var withAll = permits.withAll || undefined;

                //check with any permissions
                var withAny = permits.withAny || undefined;

                //order permission to check
                //based on order of precedence
                var checkPemits;

                if (withAny) {
                    checkPemits =
                        $user.hasAnyPermission(withAny);
                }

                if (withAll) {
                    checkPemits =
                        $user.hasPermissions(withAll);
                }

                if (withOnly) {
                    checkPemits =
                        $user.hasPermission(withOnly);
                }

                return checkPemits;

            };

            return $user;
        });

}());