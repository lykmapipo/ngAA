/**
 * DRY authentication and authorization for angular
 * @version v0.1.0 - Fri Feb 20 2015 23:49:12
 * @link https://github.com/lykmapipo/ngAA
 * @authors lykmapipo <lallyelias87@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

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
        .config(['$httpProvider', '$stateProvider', 'jwtInterceptorProvider', 'ngAAConfig', function($httpProvider, $stateProvider, jwtInterceptorProvider, ngAAConfig) {
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
        }])
        .run(['$rootScope', '$state', 'ngAAConfig', 'User', function($rootScope, $state, ngAAConfig, User) {
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
                                        .$broadcast('$stateChangePermissionDenied', 'Not authenticated');

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
                                                    .$broadcast('$stateChangePermissionDenied', 'Not permitted');

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
                                                    .$broadcast('$stateChangePermissionAccepted', toState, toParams);

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
        }]);

}());

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

(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.providers:Auth
     * @description ngAA authentication service provider
     */
    angular
        .module('ngAA')
        .provider('$auth', ['ngAAConfig', function(ngAAConfig) {
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
            self.$get = ['Token', 'User', function(Token, User) {
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
            }];
        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAA.Token
     * @description common token management
     */
    angular
        .module('ngAA')
        .factory('Token', ['$localStorage', '$sessionStorage', 'jwtHelper', 'ngAAConfig', function($localStorage, $sessionStorage, jwtHelper, ngAAConfig) {
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
        }]);

}());

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
        .factory('User', ['$q', '$location', '$http', 'Token', 'ngAAConfig', 'Utils', function($q, $location, $http, Token, ngAAConfig, Utils) {
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
        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAA.utils
     * @description set of utilities to use in ngAA
     */
    angular
        .module('ngAA')
        .factory('Utils', function() {
            var $utils = {};

            //array includes utility
            //but rather that exted Array.prototype
            //you have to pass the container array
            //see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
            $utils.includes = function(container, searchElement /*, fromIndex*/ ) {
                var O = Object(container);
                var len = parseInt(O.length) || 0;
                if (len === 0) {
                    return false;
                }
                var n = parseInt(arguments[2]) || 0;
                var k;
                if (n >= 0) {
                    k = n;
                } else {
                    k = len + n;
                    if (k < 0) {
                        k = 0;
                    }
                }
                var currentElement;
                while (k < len) {
                    currentElement = O[k];
                    if (searchElement === currentElement ||
                        (searchElement !== searchElement && currentElement !== currentElement)) {
                        return true;
                    }
                    k++;
                }
                return false;
            };

            //transverse a container
            //to check if it contains all
            //of the search elements
            $utils.includesAll = function(container, searchElements) {
                var includesAll = true;

                //check if container contains all of 
                //searched element
                angular
                    .forEach(searchElements, function(searchElement) {
                        includesAll =
                            includesAll && $utils.includes(container, searchElement);

                    });

                return includesAll;
            };

            //transverse a container
            //to check if it contains any
            //of the search elements
            $utils.includesAny = function(container, searchElements) {
                var includesAny = false;

                //check if container contains any of 
                //searched element
                angular
                    .forEach(searchElements, function(searchElement) {
                        includesAny =
                            includesAny || $utils.includes(container, searchElement);
                    });

                return includesAny;

            };

            return $utils;
        });

}());

(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.directive:signout
     * @description signout current user
     */
    angular
        .module('ngAA')
        .directive('signout', ['$rootScope', '$state', 'User', 'ngAAConfig', function($rootScope, $state, User, ngAAConfig) {
            return {
                restrict: 'A',
                link: function(scope, element) {

                    function signout(event) {

                        event.preventDefault();

                        User
                            .signout()
                            .then(function() {
                                $rootScope.$broadcast('signoutSuccess');
                                $rootScope.isAuthenticated = false;
                                // $location.path(ngAAConfig.afterSignoutRedirectTo);
                                $state.go(ngAAConfig.afterSignoutRedirectTo);
                            })
                            .catch(function(error) {
                                $rootScope.$broadcast('signoutError', error.message);
                            });

                    }

                    //attach listener
                    element.on ?
                        element.on('click', signout) :
                        element.bind('click', signout);
                }
            };
        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.controller:AuthCtrl
     * @description
     * # AuthCtrl
     * Controller of the ngAA
     */
    angular
        .module('ngAA')
        .controller('AuthCtrl', ['$rootScope', '$scope', 'User', 'ngAAConfig', '$state', function($rootScope, $scope, User, ngAAConfig, $state) {
            //user model
            $scope.user = {
                email: '',
                password: ''
            };

            //signin current
            //provided user credentials
            $scope.signin = function() {
                User
                    .signin($scope.user)
                    .then(function(response) {
                        $rootScope.$broadcast('signinSuccess', response);
                        $rootScope.isAuthenticated = true;
                        $state.go(ngAAConfig.afterSigninRedirectTo);
                    })
                    .catch(function(error) {
                        $rootScope.$broadcast('signinError', error.message);
                    });
            };

        }]);
}());

;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    var str = String(input).replace(/=+$/, '');
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());
