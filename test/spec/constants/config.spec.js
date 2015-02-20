'use strict';

describe('ngAA: ngAAConfig', function() {
    var Config;

    // load the controller's module
    beforeEach(module('ngAA'));

    // inject ngAAConfig
    beforeEach(inject(function(ngAAConfig) {
        Config = ngAAConfig;
    }));

    it('should exists after being injected', function() {
        expect(Config).to.not.be.null;
    });

    it('should have default values', function() {
        expect(Config.httpInterceptor).to.equal(true);
        expect(Config.afterSigninRedirectTo).to.equal('home');
        expect(Config.afterSignoutRedirectTo).to.equal('signin');
        expect(Config.signinUrl).to.equal('/signin');
        expect(Config.signinState).to.equal('signin');
        expect(Config.tokenPrefix).to.equal('ngAA');
        expect(Config.tokenName).to.equal('token');
        expect(Config.authHeader).to.equal('Authorization');
    });
});