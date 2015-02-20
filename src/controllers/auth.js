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
        .controller('AuthCtrl', function($scope) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
        });
}());