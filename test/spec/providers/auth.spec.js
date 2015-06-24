'use strict';

describe('ngAA:Provider:$authProvider', function() {
    var authProvider;
    var stateProvider;
    var httpBackend;
    var Config;
    var claim;
    var token;

    //user profile
    var user = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        avatar: faker.internet.avatar(),
        permissions: [
            'Post:create',
            'Post:edit',
            'Post:delete',
            'Post:*'
        ]
    };


    /// inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider, $stateProvider) {
            authProvider = $authProvider;
            stateProvider = $stateProvider;
        });
    });

    // inject ngAAConfig
    beforeEach(inject(function(ngAAConfig, $httpBackend) {
        Config = ngAAConfig;
        httpBackend = $httpBackend;
    }));

    //create a jwt claim
    beforeEach(function() {
        claim = {
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            sub: 12345
        };

        var sHead = JSON.stringify({
            alg: 'HS256',
            typ: 'JWT'
        });

        token =
            KJUR.jws.JWS.sign(null, sHead, JSON.stringify(claim), '123456');
    });

    it('should exist', function() {
        expect(Config).to.not.be.null;
        expect(authProvider).to.not.be.null;
    });

    it('should be able set afterSigninRedirectTo state', function() {
        authProvider.afterSigninRedirectTo = 'dashboard';
        expect(Config.afterSigninRedirectTo).to.equal('dashboard');
        expect(authProvider.afterSigninRedirectTo).to.equal('dashboard');
    });

    it('should be able set afterSignoutRedirectTo state', function() {
        authProvider.afterSignoutRedirectTo = 'home';
        expect(Config.afterSignoutRedirectTo).to.equal('home');
        expect(authProvider.afterSignoutRedirectTo).to.equal('home');
    });

    it('should be able set backend signinUrl', function() {
        authProvider.signinUrl = '/auth/signin';
        expect(Config.signinUrl).to.equal('/auth/signin');
        expect(authProvider.signinUrl).to.equal('/auth/signin');
    });

    it('should be able set application signinState', function() {
        authProvider.signinState = 'auth.signin';
        expect(Config.signinState).to.equal('auth.signin');
        expect(authProvider.signinState).to.equal('auth.signin');
    });

    it('should be able set application signinTemplateUrl', function() {
        authProvider.signinTemplateUrl = 'views/auth/signin.html';
        expect(Config.signinTemplateUrl).to.equal('views/auth/signin.html');
        expect(authProvider.signinTemplateUrl).to.equal('views/auth/signin.html');
    });

    it('should be able set authorization tokenPrefix', function() {
        authProvider.tokenPrefix = '_t_';
        expect(Config.tokenPrefix).to.equal('_t_');
        expect(authProvider.tokenPrefix).to.equal('_t_');
    });

    it('should be able set authorization tokenName', function() {
        authProvider.tokenName = 'tokenar';
        expect(Config.tokenName).to.equal('tokenar');
        expect(authProvider.tokenName).to.equal('tokenar');
    });

    it('should be able set authorization authHeader', function() {
        authProvider.authHeader = 'AUTH';
        expect(Config.authHeader).to.equal('AUTH');
        expect(authProvider.authHeader).to.equal('AUTH');
    });

    it('should be able to go to `toState` if user is authenticated and has permits', inject(function($rootScope, $state, $auth) {
        authProvider.profileKey = 'user';
        authProvider.tokenName = 'token';

        stateProvider
            .state('dashboard', {
                url: '/dashboard',
                template: '<h1>CDashboard</h1>',
                data: {
                    permits: {
                        withAll: ['Post:create', 'Post:create']
                    }
                }
            });

        httpBackend
            .whenPOST(authProvider.signinUrl)
            .respond(function( /*method, url, data, headers*/ ) {
                return [200, {
                    token: token,
                    user: user
                }, {}];
            });

        var isPermitted = false;
        $rootScope
            .$on('permissionAccepted', function( /*event, toState, toParams*/ ) {
                isPermitted = true;
            });

        var isSignin = false;
        $auth
            .signin(user)
            .then(function() {
                isSignin = true;

                //navigate to state with permits
                $state.go('dashboard');
            });

        httpBackend.flush();
        $rootScope.$apply();

        expect($state.current.name).to.equal('dashboard');
        expect(isPermitted).to.be.true;
        expect(isSignin).to.be.true;
    }));


    it('should not allow an authenticated and un permitted user to go to restricted state', inject(function($rootScope, $state) {
        authProvider.profileKey = 'user';
        authProvider.tokenName = 'token';
        authProvider.signinState = 'signin-t';

        stateProvider
            .state('signin-t', {
                template: '<h1>Signin</h1>',
            });

        stateProvider
            .state('contact', {
                url: '/contact',
                template: '<h1>Contact</h1>',
                data: {
                    permits: {
                        withAll: ['Post:create', 'Post:create']
                    }
                }
            });


        var isPermitted = true;
        $rootScope
            .$on('permissionDenied', function( /*event, toState, toParams*/ ) {
                isPermitted = false;
            });

        //navigate to state with permits
        $state.go('contact');

        $rootScope.$apply();

        expect($state.current.name).to.equal('signin-t');
        expect(isPermitted).to.be.false;
    }));
});