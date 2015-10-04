'use strict';

describe('ngAA:Constant:ngAAConfig', function() {
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
        
        expect(Config.afterSigninRedirectTo).to.equal('home');
        expect(Config.afterSignoutRedirectTo).to.equal('signin');
        
        expect(Config.signinUrl).to.equal('/signin');
        expect(Config.signinState).to.equal('signin');
        expect(Config.signinRoute).to.equal('/signin');
        expect(Config.signinTemplateUrl).to.equal('views/signin.html');
        
        expect(Config.tokenPrefix).to.equal('ngAA');
        expect(Config.tokenName).to.equal('token');
        expect(Config.profileKey).to.equal('user');
        expect(Config.storage).to.equal('localStorage');
        expect(Config.authHeader).to.equal('Authorization');
    });
});