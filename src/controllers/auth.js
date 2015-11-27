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
            $scope.user = {
                email: '',
                password: ''
            };

            //signin current
            //provided user credentials
            $scope.signin = function() {
                ngAAUser
                    .signin($scope.user)
                    .then(function(response) {
                        //clear email and password
                        $scope.user.email = '';
                        $scope.user.password = '';

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