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
            self.$get = function(Utils, Token, User, ngAAConfig, $rootScope, $state) {
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

                $auth._onStateChange = function(event, toState, toParams, fromState, fromParams) {
                    // If there are permits defined in toState 
                    // then prevent default and attempt to authorize
                    var permits = Utils.getStatePermits(toState);

                    //if there are permits
                    //defined and state is not signinState
                    //prevent default state change
                    //and chech permits
                    //before transition to state
                    var shouldCheckPermits =
                        permits &&
                        toState.name !== ngAAConfig.signinState;

                    if (shouldCheckPermits) {
                        //prevent default state transition
                        event.preventDefault();

                        //check if user is authenticated
                        //and has permission
                        User
                            .isAuthenticated()
                            .then(function(isAuthenticated) {
                                //if not authenticated
                                //throw exception
                                if (!isAuthenticated) {
                                    throw new Error('Not authenticated');
                                }

                                //user is authenticated
                                //chech for profile permissions 
                                else {
                                    User
                                        .checkPermits(permits)
                                        .then(function(hasPermit) {
                                            //if has no permit
                                            //broadcast execptions and
                                            //redirect to signin
                                            if (!hasPermit) {
                                                throw new Error('Not permitted');
                                            }

                                            //user is authenticated
                                            //and permitted
                                            //continue to next state
                                            else {
                                                // If authorized, use call state.go without triggering the event.
                                                // Then trigger $stateChangeSuccess manually to resume the rest of the process
                                                // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
                                                $rootScope
                                                    .$broadcast(
                                                        '$permissionAccepted',
                                                        toState,
                                                        toParams
                                                    );

                                                $state
                                                    .go(
                                                        toState.name,
                                                        toParams, {
                                                            notify: false
                                                        })
                                                    .then(function() {
                                                        $rootScope
                                                            .$broadcast(
                                                                '$stateChangeSuccess',
                                                                toState,
                                                                toParams,
                                                                fromState,
                                                                fromParams
                                                            );
                                                    });
                                            }
                                        });
                                }
                            })
                            .catch(function(error) {
                                //broadcast the error
                                $rootScope
                                    .$broadcast(
                                        'permissionDenied',
                                        error.message
                                    );

                                //and redirect user to signin state
                                $state.go(ngAAConfig.signinState);
                            });
                    }
                    //no permits defined
                    //continue with normal state change
                    else {
                        return;
                    }
                };

                return $auth;
            };
        });

}());