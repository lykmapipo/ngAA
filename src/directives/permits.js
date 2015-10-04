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
        .directive('showIfHasPermit', function($animate, ngAAUser) {

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

        });


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
        .directive('showIfHasPermits', function($animate, ngAAUser) {

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

        });


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
        .directive('showIfHasAnyPermit', function($animate, ngAAUser) {

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

        });

}());