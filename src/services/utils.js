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