(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["angular"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("angular"),require("angular-jwt"),require("angular-ui-router"),require("ngstorage"));
  } else {
    factory(angular);
  }
}(this, function (angular) {

/**
 * DRY authentication and authorization for angular and ui-router
 * @version v0.3.0 - Sun Mar 27 2016 09:45:44
 * @link https://github.com/lykmapipo/ngAA
 * @authors lykmapipo <lallyelias87@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function() {
    'use strict';

    var $stateProviderRef = null;

    /**
     * @ngdoc module
     * @name ngAA
     * @description DRY authentication and authorization for angular and ui-router
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
        .config(['$httpProvider', '$stateProvider', 'jwtInterceptorProvider', 'ngAAConfig', function($httpProvider, $stateProvider, jwtInterceptorProvider, ngAAConfig) {
            $stateProviderRef = $stateProvider;

            //configure jwtInterceptorProvider
            jwtInterceptorProvider.authHeader = ngAAConfig.authHeader;

            // Please note we are annotating the function so that 
            // the $injector works when the file is minified
            jwtInterceptorProvider.tokenGetter = ['ngAAToken', function($token) {
                //grab token from the TokenFactory
                var token = $token.getToken();

                //if http interception is allowed
                //intercept the request
                //with authorization header
                if (token) {
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
        .run(['$rootScope', '$state', 'ngAAConfig', '$auth', function($rootScope, $state, ngAAConfig, $auth) {
            
            //configure ngAA states
            $stateProviderRef
                .state(ngAAConfig.signinState, {
                    url: ngAAConfig.signinRoute,
                    templateUrl: ngAAConfig.signinTemplateUrl,
                    controller: 'ngAAAuthCtrl'
                });
                

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
            $rootScope.isAuthenticated = $auth.isAuthenticatedSync();
        }]);

}());

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

(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name $auth
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
            self.$get = ['ngAAUtils', 'ngAAToken', 'ngAAUser', 'ngAAConfig', '$rootScope', '$state', function(ngAAUtils, ngAAToken, ngAAUser, ngAAConfig, $rootScope, $state) {
                var $auth = {};

                $auth.signin = function(user) {
                    return ngAAUser.signin(user);
                };

                $auth.signout = function() {
                    return ngAAUser.signout();
                };

                $auth.isAuthenticated = function() {
                    return ngAAUser.isAuthenticated();
                };

                $auth.isAuthenticatedSync = function() {
                    return ngAAUser.isAuthenticatedSync();
                };

                $auth.getClaim = function() {
                    return ngAAToken.getClaim();
                };

                $auth.getProfile = function() {
                    return ngAAUser.getProfile();
                };


                $auth.hasPermission = function(permission) {
                    return ngAAUser.hasPermission(permission);
                };

                $auth.hasPermissions = function(checkPermissions) {
                    return ngAAUser.hasPermissions(checkPermissions);
                };

                $auth.hasAnyPermission = function(checkPermissions) {
                    return ngAAUser.hasAnyPermission(checkPermissions);
                };

                //TODO refactor
                $auth._onStateChange = function(event, toState, toParams, fromState, fromParams) {
                    // If there are permits defined in toState 
                    // then prevent default and attempt to authorize
                    var permits = ngAAUtils.getStatePermits(toState);

                    //grab authenticated data from state
                    var shouldCheckAuthenticity =
                        toState.data ? toState.data.authenticated : undefined;


                    //if there are permits
                    //defined and state is not signinState
                    //prevent default state change
                    //and chech permits
                    //before transition to state
                    var shouldCheckPermits =
                        permits &&
                        toState.name !== ngAAConfig.signinState;

                    //check for authenticity only
                    if (shouldCheckAuthenticity && !shouldCheckPermits) {
                        //prevent default state transition
                        event.preventDefault();

                        //check if user is authenticated
                        //and has permission
                        ngAAUser.isAuthenticated().then(function(isAuthenticated) {
                            //if not authenticated
                            //throw exception
                            if (!isAuthenticated) {
                                //broadcast the error
                                $rootScope
                                    .$broadcast(
                                        'authenticationDenied',
                                        'Not authenticated'
                                    );

                                //and redirect user to signin state
                                $state.go(ngAAConfig.signinState);
                            }
                            //user is authenticated
                            //continue to next state
                            else {
                                // If authenticated, use call state.go without triggering the event.
                                // Then trigger $stateChangeSuccess manually to resume the rest of the process
                                // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
                                $rootScope
                                    .$broadcast(
                                        'authenticationAccepted',
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

                    //check for authenticity and permits
                    else if (shouldCheckPermits) {
                        //prevent default state transition
                        event.preventDefault();

                        //check if user is authenticated
                        //and has permission
                        ngAAUser
                            .isAuthenticated()
                            .then(function(isAuthenticated) {
                                //if not authenticated
                                //throw exception
                                if (!isAuthenticated) {
                                    //broadcast the error
                                    $rootScope
                                        .$broadcast(
                                            'permissionDenied',
                                            'Not authenticated'
                                        );

                                    //and redirect user to signin state
                                    $state.go(ngAAConfig.signinState);
                                }

                                //user is authenticated
                                //chech for profile permissions 
                                else {
                                    ngAAUser
                                        .checkPermits(permits)
                                        .then(function(hasPermit) {
                                            //if has no permit
                                            //broadcast execptions and
                                            //redirect to signin
                                            if (!hasPermit) {
                                                //broadcast the error
                                                $rootScope
                                                    .$broadcast(
                                                        'permissionDenied',
                                                        'Not permitted'
                                                    );

                                                //and redirect user to signin state
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
                                                    .$broadcast(
                                                        'permissionAccepted',
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
                            });
                    }
                    //no permits defined
                    //and do not check authenticity
                    //continue with normal state change
                    else {
                        return;
                    }
                };

                return $auth;
            }];
        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ngAAToken
     * @description common token management
     */
    angular
        .module('ngAA')
        .factory('ngAAToken', ['$localStorage', '$sessionStorage', 'jwtHelper', 'ngAAConfig', function($localStorage, $sessionStorage, jwtHelper, ngAAConfig) {
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
     * @name ngAAUser
     * @description user management service
     */
    angular
        .module('ngAA')
        .factory('ngAAUser', ['$q', '$http', 'ngAAToken', 'ngAAConfig', 'ngAAUtils', function($q, $http, ngAAToken, ngAAConfig, ngAAUtils) {
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
        .factory('ngAAUtils', function() {
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
            //get state defined
            //permits
            $utils.getStatePermits = function(state) {
                var permits;

                //check if state has 
                //data hash definition
                //and permits definition
                //and grab the permits
                //from it
                if (state.data && state.data.permits) {
                    permits = state.data.permits;
                }

                return permits;
            };

            return $utils;
        });

}());

(function() {
    'use strict';

    //borrowed from 
    //https://github.com/angular/angular.js/blob/master/src/ng/directive/ngShowHide.js
    var NG_HIDE_CLASS = 'ng-hide';
    var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';

    //add or remove ng-hide class on element
    //borrowed from 
    //https://github.com/angular/angular.js/blob/master/src/ng/directive/ngShowHide.js
    function animate($animate, element, value) {
        $animate[value ? 'removeClass' : 'addClass'](element, NG_HIDE_CLASS, {
            tempClasses: NG_HIDE_IN_PROGRESS_CLASS
        });
    }

    //parse comma separated string into
    //array of permissions
    function parsePermissions(values) {
        if (values) {
            return values.split(',').map(function(permission) {
                return permission.trim();
            });
        } else {
            return [];
        }
    }


    /**
     * @ngdoc directive
     * @name showIfHasPermit
     * @description shows the given HTML element if current
     *              signed in user has a given permission, otherwise the
     *              element is hidden
     *
     * @example
     *         <li show-if-has-permit="User:edit">
     *              <a href="">Edit</a>
     *          </li>
     */
    angular
        .module('ngAA')
        .directive('showIfHasPermit', ['$animate', 'ngAAUser', function($animate, ngAAUser) {

            return {
                restrict: 'A',
                multiElement: true,
                link: function(scope, element, attr) {
                    //check if current signed in user
                    //has the provided permission
                    ngAAUser
                        .hasPermission(attr.showIfHasPermit)
                        .then(function(hasPermission) {
                            animate($animate, element, hasPermission);
                        })
                        .catch(function( /*error*/ ) {
                            animate($animate, element, false);
                        });

                }
            };

        }]);


    /**
     * @ngdoc directive
     * @name showIfHasAllPermits
     * @description shows the given HTML element if current
     *              signed in user has all given permissions, otherwise the
     *              element is hidden
     *
     * @example
     *         <li show-if-has-permits="User:view, User:create">
     *              <a href="">Create</a>
     *         </li>
     */
    angular
        .module('ngAA')
        .directive('showIfHasPermits', ['$animate', 'ngAAUser', function($animate, ngAAUser) {

            return {
                restrict: 'A',
                multiElement: true,
                link: function(scope, element, attr) {
                    //prepare permissions to check
                    var permissions =
                        parsePermissions(attr.showIfHasPermits);

                    //check if current signed in user
                    //has all of the provided permission
                    ngAAUser
                        .hasPermissions(permissions)
                        .then(function(hasPermissions) {
                            animate($animate, element, hasPermissions);
                        })
                        .catch(function( /*error*/ ) {
                            animate($animate, element, false);
                        });

                }
            };

        }]);


    /**
     * @ngdoc directive
     * @name showIfHasAnyPermit
     * @description shows the given HTML element if current
     *              signed in user has any of the given permissions,
     *              otherwise the element is hidden
     *
     * @example
     *         <li show-if-has-any-permit="User:view, User:create">
     *              <a href="">View</a>
     *         </li>
     */
    angular
        .module('ngAA')
        .directive('showIfHasAnyPermit', ['$animate', 'ngAAUser', function($animate, ngAAUser) {

            return {
                restrict: 'A',
                multiElement: true,
                link: function(scope, element, attr) {
                    //prepare permissions to check
                    var permissions =
                        parsePermissions(attr.showIfHasAnyPermit);

                    //check if current signed in user
                    //has any of the provided permission
                    ngAAUser
                        .hasAnyPermission(permissions)
                        .then(function(hasAnyPermission) {
                            animate($animate, element, hasAnyPermission);
                        })
                        .catch(function( /*error*/ ) {
                            animate($animate, element, false);
                        });

                }
            };

        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name signout
     * @description signout current signin user.
     *              It will clear the current user
     *              token and its profile from the storage.
     *
     * @example
     *         <li ng-show="isAuthenticated">
     *              <a href="" data-signout>Signout</a>
     *           </li>
     */
    angular
        .module('ngAA')
        .directive('signout', ['$rootScope', '$state', 'ngAAUser', 'ngAAConfig', function($rootScope, $state, ngAAUser, ngAAConfig) {
            return {
                restrict: 'A',
                link: function(scope, element) {

                    //signout event handler
                    function signout(event) {
                        //prevent any of the default
                        //behaviour of the event fired
                        event.preventDefault();

                        //signout the current user
                        ngAAUser
                            .signout()
                            .then(function() {
                                //broadcast user signed
                                //out successfully
                                $rootScope.$broadcast('signoutSuccess');

                                //update user authenticity status
                                $rootScope.isAuthenticated =
                                    ngAAUser.isAuthenticatedSync();

                                //redirect to after signout
                                //state
                                $state
                                    .go(ngAAConfig.afterSignoutRedirectTo);
                            })
                            .catch(function(error) {
                                //broadcats any
                                //error encountered during
                                //signout
                                $rootScope
                                    .$broadcast('signoutError', error.message);
                            });

                    }

                    //attach event listener
                    //on the element
                    if (element.on) {
                        element.on('click', signout);
                    } else {
                        element.bind('click', signout);
                    }
                }
            };
        }]);

}());

(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAAAuthCtrl
     * @description default user authentication controller
     */
    angular
        .module('ngAA')
        .controller('ngAAAuthCtrl', ['$rootScope', '$scope', 'ngAAUser', 'ngAAConfig', '$state', function($rootScope, $scope, ngAAUser, ngAAConfig, $state) {
            //user model
            $scope.user = {};

            //signin current
            //provided user credentials
            $scope.signin = function() {
                //notify signin begin to allow third-party to add spinner or
                //other custom logics
                $rootScope.$broadcast('signinBegin');

                ngAAUser
                    .signin($scope.user)
                    .then(function(response) {
                        //clear user
                        $scope.user = {};

                        //broadcast signin success
                        $rootScope.$broadcast('signinSuccess', response);

                        //set user authentication status
                        $rootScope.isAuthenticated =
                            ngAAUser.isAuthenticatedSync();

                        //redirect to after signin state
                        $state.go(ngAAConfig.afterSigninRedirectTo);
                    })
                    .catch(function(error) {
                        //add signin errors in scope
                        //to allow rendering feedback to user
                        $scope.signinError = error;

                        //broadcast error message
                        $rootScope.$broadcast('signinError', error);
                    });
            };

        }]);
}());

}));
