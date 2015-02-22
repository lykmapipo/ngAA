(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name ngAA
     * @description DRY authentication and authorization for angular
     */
    angular
        .module('ngAA', [
            //depend on ngStorage for
            //$sessionStorage and $localStorage
            //see https://github.com/gsklee/ngStorage
            'ngStorage',
            //depend on angular-jwt
            //for common jwt functionalities
            //see https://github.com/auth0/angular-jwt
            'angular-jwt',
            //depend on ui-router
            //see https://github.com/angular-ui/ui-router
            'ui.router'
        ])
        //configure http interceptor
        .config(function($httpProvider, $stateProvider, jwtInterceptorProvider, ngAAConfig) {
            //configure ngAA states
            $stateProvider
                .state(ngAAConfig.signinState, {
                    url: ngAAConfig.signinRoute,
                    templateUrl: ngAAConfig.signinTemplateUrl,
                    controller: 'AuthCtrl'
                });


            //configure jwtInterceptorProvider
            jwtInterceptorProvider.authHeader = ngAAConfig.authHeader;

            // Please note we are annotating the function so that 
            // the $injector works when the file is minified
            jwtInterceptorProvider.tokenGetter = ['Token', function($token) {
                //grab token from the TokenFactory
                var token = $token.getToken();

                //if http interception is allowed
                //intercept the request
                //with authorization header
                if (token && ngAAConfig.httpInterceptor) {
                    return token;
                }

                //if not intercept http
                //return null 
                else {
                    return null;
                }
            }];

            //adding jwtInterceptor
            //to the list of interceptors
            //see https://github.com/auth0/angular-jwt#jwtinterceptor
            $httpProvider.interceptors.push('jwtInterceptor');
        })
        .run(function($rootScope, $state, ngAAConfig, User) {
            //check for permit during state change
            $rootScope
                .$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    // If there are permits defined in toState 
                    // then prevent default and attempt to authorize
                    var permits;
                    if (toState.data && toState.data.permits) {
                        permits = toState.data.permits;
                    }

                    //if there are permits
                    //defined and state is not `$authProvider.signinState`
                    //prevent default state change
                    //and chech permits
                    //before transition to state
                    if (permits && toState.name !== ngAAConfig.signinState) {

                        event.preventDefault();

                        //check only permissions
                        var withOnly = permits.withOnly || undefined;

                        //check with all permissions
                        var withAll = permits.withAll || undefined;

                        //check with any permissions
                        var withAny = permits.withAny || undefined;

                        //order permission to check
                        //based on order of precedence
                        var checkPermission;
                        if (withAny) {
                            checkPermission =
                                User.hasAnyPermission(withAny);
                        }
                        if (withAll) {
                            checkPermission =
                                User.hasPermissions(withAll);
                        }
                        if (withOnly) {
                            checkPermission =
                                User.hasPermission(withOnly);
                        }

                        //check if authentication is required
                        //check if user is authenticated
                        //and has permission
                        User
                            .isAuthenticated()
                            .then(function(isAuthenticated) {
                                //if not authenticated
                                //throw exception
                                //and redirect to signin
                                if (!isAuthenticated) {
                                    //broadcast the error
                                    $rootScope
                                        .$broadcast('$permissionDenied', 'Not authenticated');

                                    //and redirect user to signin
                                    $state.go(ngAAConfig.signinState);
                                }
                                //user is authenticated
                                //chech for profile permissions 
                                else {
                                    checkPermission
                                        .then(function(hasPermit) {
                                            //if has no permit
                                            //broadcast execptions and
                                            //redirect to signin
                                            if (!hasPermit) {
                                                //broadcast the error
                                                $rootScope
                                                    .$broadcast('$permissionDenied', 'Not permitted');

                                                //and redirect user to signin
                                                $state.go(ngAAConfig.signinState);
                                            }
                                            //user is authenticated
                                            //and permitted
                                            //continue to next state
                                            else {
                                                // If authorized, use call state.go without triggering the event.
                                                // Then trigger $stateChangeSuccess manually to resume the rest of the process
                                                // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
                                                $rootScope
                                                    .$broadcast('$permissionAccepted', toState, toParams);

                                                $state
                                                    .go(toState.name, toParams, {
                                                        notify: false
                                                    })
                                                    .then(function() {
                                                        $rootScope
                                                            .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                                    });
                                            }
                                        });
                                }
                            });
                    }
                    //no permits defined
                    //continue with normal state change
                    else {
                        return;
                    }
                });

            //reload user on application browser refresh
            //otherwise redirect to `ngAAConfig.signinState`
            //
            //expose `isAuthenticated` in $rootScope
            $rootScope.isAuthenticated = User.isAuthenticatedSync();
        });

}());