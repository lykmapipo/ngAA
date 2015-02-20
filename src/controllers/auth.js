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
                        $rootScope.$broadcast('signinSuccess', response);
                        $rootScope.isAuthenticated = true;
                        $state.go(ngAAConfig.afterSigninRedirectTo);
                    })
                    .catch(function(error) {
                        $rootScope.$broadcast('signinError', error.message);
                    });
            };

        });
}());