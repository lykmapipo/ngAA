'use strict';

describe('ngAA:Module', function() {
    var authProvider;
    var httpBackend;
    var stateProvider;

    /// inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider, $stateProvider) {
            authProvider = $authProvider;
            stateProvider = $stateProvider;
        });
    });

    // inject ngAA User
    beforeEach(inject(function($httpBackend) {
        httpBackend = $httpBackend;
    }));

    it('should be able to handle authorization errors', inject(function($rootScope, $http, $state) {
        authProvider.signinState = 'signin-t';

        stateProvider
            .state('signin-t', {
                template: '<h1>signin</h1>',
            });

        //watch for signoutSuccess event
        var authorizationErrorEmitted = false;
        $rootScope.$on('authorizationError', function( /*event,response*/ ) {
            authorizationErrorEmitted = true;
        });

        httpBackend
            .whenGET('/profile')
            .respond(function( /*method, url, data, headers*/ ) {
                return [401, {}, {}];
            });

        $http
            .get('/profile');

        httpBackend.flush();

        expect($state.current.name).to.equal('signin-t');
        expect(authorizationErrorEmitted).to.be.true;

    }));
});