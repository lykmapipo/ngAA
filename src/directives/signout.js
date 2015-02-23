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
        .directive('signout', function($rootScope, $state, ngAAUser, ngAAConfig) {
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
        });

}());