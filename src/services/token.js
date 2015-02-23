(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAAToken
     * @description common token management
     */
    angular
        .module('ngAA')
        .factory('ngAAToken', function($localStorage, $sessionStorage, jwtHelper, ngAAConfig) {
            var $token = {};

            //generate user profile storage
            //key
            $token.getProfileStorageKey = function() {
                //grab token storage name
                var tokenName = $token.getName();

                //build user storage key
                var profileStorageKey =
                    tokenName + '_' + ngAAConfig.profileKey;

                return profileStorageKey;
            };

            //deduce tokenName
            //from the ngAAConfig
            $token.getName = function() {
                //is tokenPrefix defined
                if (ngAAConfig.tokenPrefix) {
                    //concatenate tokenPrefix and tokenName
                    return ngAAConfig.tokenPrefix + '_' + ngAAConfig.tokenName;
                }
                //else just use token name
                else {
                    return ngAAConfig.tokenName;
                }

            };

            //deduce token storage 
            //used
            $token.getStorage = function() {
                //is storage localStorage
                if (ngAAConfig.storage === 'localStorage') {
                    //storage is $localStorage
                    return $localStorage;
                }
                //else its $sessionStorage
                else {
                    return $sessionStorage;
                }
            };

            //store user token 
            //into storage
            $token.setToken = function(response) {
                //grab token storage name
                var tokenName = $token.getName();

                //deduce token from
                //the response
                //using tokenName configuration
                var token = response.data[ngAAConfig.tokenName];

                //if no token found in 
                //above procedures
                if (!token) {
                    throw new Error('Unknown response format: ' + JSON.stringify(response.data));
                }

                //grab storage to use
                var storage = $token.getStorage();

                //store the token
                //see https://github.com/gsklee/ngStorage#read-and-write--demo
                storage[tokenName] = token;
            };


            //get user token from storage
            $token.getToken = function() {
                //get storage
                var storage = $token.getStorage();
                //get tokenName
                var tokenName = $token.getName();

                //grab token from the storage
                //see https://github.com/gsklee/ngStorage#read-and-write--demo
                return storage[tokenName];
            };

            //remove token 
            //from storage
            $token.removeToken = function() {
                //grab tokenName
                var tokenName = $token.getName();
                //grap profile storage key
                var profileStorageKey = $token.getProfileStorageKey();
                //grab storage
                var storage = $token.getStorage();

                //delete token and user profile from stora
                //see https://github.com/gsklee/ngStorage#delete--demo
                delete storage[tokenName];

                delete storage[profileStorageKey];
            };

            //check if token is expired
            $token.isTokenExpired = function() {
                //grab token from storage
                var token = $token.getToken();

                //if no token found
                //possibly user token is expired
                if (!token) {
                    return true;
                }

                //check if it expired using jwtHelper
                //see https://github.com/auth0/angular-jwt#checking-if-token-is-expired
                var tokenExpired =
                    jwtHelper.isTokenExpired(token);

                //return token expiry status
                return tokenExpired;
            };

            //decode current token
            //and get user claim
            $token.getClaim = function() {
                //grab token
                var token = $token.getToken();

                //decode token using jwtHelper
                //see https://github.com/auth0/angular-jwt#decoding-the-token
                var claim = jwtHelper.decodeToken(token);

                return claim;
            };

            return $token;
        });

}());