(function() {
    'use strict';

    /**
     * @ngdoc constant
     * @name ngAAConfig
     * @description provide default configuration of ngAA. These can be
     *              overrided using `$authProvider` when configuring
     *              the utilizing module
     */
    angular
        .module('ngAA')
        .constant('ngAAConfig', {
            //application state
            //to redirect user 
            //after signin
            afterSigninRedirectTo: 'home',

            //application state
            //to redirect user
            //after signout
            afterSignoutRedirectTo: 'signin',

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
            //
            //it will be used to
            //get a token from
            //http response
            tokenName: 'token',

            //a key to be used to
            //retrieve user profile 
            //from a http repsonse
            profileKey: 'user',

            //storage type to use
            //either sessionStorage
            //or localStorage
            storage: 'localStorage',

            //authorization header name
            authHeader: 'Authorization'
        });
}());