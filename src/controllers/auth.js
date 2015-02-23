(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name ngAA.controller:AuthCtrl
     * @description user authentication controller
     */
    angular
        .module('ngAA')
        .controller('AuthCtrl', function($rootScope, $scope, User, ngAAConfig, $state) {
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
                        //clear email and password
                        $scope.user.email = '';
                        $scope.user.password = '';

                        //broadcast signin success
                        $rootScope.$broadcast('signinSuccess', response);

                        //set user authentication status
                        $rootScope.isAuthenticated =
                            User.isAuthenticatedSync();

                        //redirect to after signin state
                        $state.go(ngAAConfig.afterSigninRedirectTo);
                    })
                    .catch(function(error) {
                        $rootScope.$broadcast('signinError', error.message);
                    });
            };

        });
}());