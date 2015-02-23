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
        .run(function($rootScope, $state, ngAAConfig, User, $auth) {
            //check for permits during state change
            $rootScope
                .$on('$stateChangeStart', $auth._onStateChange);

            //handle backend 
            //http authorization errors
            $rootScope
                .$on('unauthenticated', function(event, response) {
                    //broadcast authorization error
                    $rootScope
                        .$broadcast('authorizationError', response);

                    //redirect user to signin
                    //state
                    $state.go(ngAAConfig.signinState);
                });

            //expose `isAuthenticated` in $rootScope
            //so that it can be used in views
            //and demanding controllers
            $rootScope.isAuthenticated = User.isAuthenticatedSync();
        });

}());