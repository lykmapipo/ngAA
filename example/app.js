'use strict';
angular
    .module('ngAPP', [
        'ui.router',
        'ngAA',
        'ngFaker'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.afterSigninRedirectTo = 'contact';
        $authProvider.afterSignoutRedirectTo = 'main';
        //unmatched route handler
        $urlRouterProvider.otherwise('/');

        //states
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                data: {
                    permits: {
                        withOnly: 'Post:delete'
                    }
                }
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'views/contact.html',
                controller: 'ContactCtrl',
                data: {
                    permits: {
                        withOnly: 'Post:create'
                    }
                },
                resolve: {
                    profile: function($q, $auth) {
                        return $auth.getProfile();
                    }
                }
            });

    });