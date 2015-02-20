(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.constants:ngAAConfig
     * @description provide default configuration of ngAA. These can be
     *              ovverrided using `$authProvider` when configuring
     *              the utilizing module
     */
    angular
        .module('ngAA')
        .constant('ngAAConfig', {
            //Intercept each request
            //and make sure authorization header
            //are available
            httpInterceptor: true,

            //application route
            //to redirect user 
            //after signin
            afterSigninRedirectTo: '/home',

            //application route
            //to redirect user
            //after signout
            afterSignoutRedirectTo: '/signin',

            //backend or api signin endpoint
            signinUrl: '/signin',

            //application state
            //to signin user
            signinState: 'signin',

            //application route
            //to signin user
            signinRoute: '/signin',

            //template to be used for signin
            signinTemplateUrl: 'views/signin.html',

            //authorization
            //token prefix
            //
            //it will be used in computing a token name
            //that will be used as a key to store
            //the token in storage
            tokenPrefix: 'ngAA',

            //authorization
            //token name
            tokenName: 'token',

            //a key to be used to
            //retrieve user profile 
            //from a repsonse
            profileKey: 'user',

            //storage type to use
            //either sessionStorage
            //or localStorage
            storage: 'localStorage',

            //authorization header name
            authHeader: 'Authorization'
        });
}());