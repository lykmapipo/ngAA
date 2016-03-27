(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAAAuthCtrl
     * @description default user authentication controller
     */
    angular
        .module('ngAA')
        .controller('ngAAAuthCtrl', function($rootScope, $scope, ngAAUser, ngAAConfig, $state) {
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

        });
}());