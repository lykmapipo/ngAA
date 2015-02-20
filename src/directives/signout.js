(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.directive:signout
     * @description signout current user
     */
    angular
        .module('ngAA')
        .directive('signout', function($rootScope, $state, User, ngAAConfig) {
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
        });

}());