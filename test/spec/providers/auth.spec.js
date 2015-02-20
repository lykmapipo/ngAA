'use strict';

describe('ngAA: $authProvider', function() {
    var authProvider;
    var Config;

    /// inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider) {
            authProvider = $authProvider;
        });
    });

    // inject ngAAConfig
    beforeEach(inject(function(ngAAConfig) {
        Config = ngAAConfig;
    }));

    it('should exist', function() {
        expect(Config).to.not.be.null;
        expect(authProvider).to.not.be.null;
    });

    it('should be able set httpInterceptor', function() {
        authProvider.httpInterceptor = false;
        expect(Config.httpInterceptor).to.equal(false);
        expect(authProvider.httpInterceptor).to.equal(false);
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
});