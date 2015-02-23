'use strict';

describe('ngAA:Service:Token', function() {
    var authProvider;
    var $token;
    var claim;
    var token;

    /// inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider) {
            authProvider = $authProvider;
        });
    });

    // inject ngAA Token
    beforeEach(inject(function(ngAAToken) {
        $token = ngAAToken;
    }));

    //create a jwt claim
    beforeEach(function() {
        claim = {
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            sub: 12345
        };
    });


    it('should exist', function() {
        expect($token).to.not.be.null;
    });

    it('should be able to get user profileStorageKey', function() {
        expect($token).to.respondTo('getProfileStorageKey');

        authProvider.tokenPrefix = '_r_';
        authProvider.tokenName = 'token';
        authProvider.profileKey = 'profile';

        expect($token.getProfileStorageKey()).to.equal('_r__token_profile');
    });

    it('should be able to return tokenName', function() {
        expect($token).to.respondTo('getName');

        authProvider.tokenPrefix = '_r_';
        authProvider.tokenName = 'token';

        expect($token.getName()).to.equal('_r__token');
    });

    it('should be able to get token storage', function() {
        var storage = $token.getStorage();

        expect(storage).to.not.be.null;
        expect(storage.$default).to.exist;
        expect(storage.$reset).to.exist;
    });

    it('should be able to set token from response http', function() {

        var sHead = JSON.stringify({
            alg: 'HS256',
            typ: 'JWT'
        });

        token =
            KJUR.jws.JWS.sign(null, sHead, JSON.stringify(claim), '123456');

        authProvider.tokenName = 'token';

        var response = {
            data: {
                'token': token
            }
        };

        expect($token).to.respondTo('setToken');

        $token.setToken(response);

        expect($token).to.respondTo('getToken');
        expect($token.getToken()).to.not.be.null;
        expect($token.getToken()).to.equal(token);

    });

    it('should be able to verify if current token is expired', function() {
        authProvider.tokenName = 'token';
        var response = {
            data: {
                'token': token
            }
        };

        $token.setToken(response);

        expect($token).to.respondTo('isTokenExpired');
        expect($token.isTokenExpired()).to.be.false;
    });


    it('should be able to get a claim from a current token', function() {
        authProvider.tokenName = 'token';
        var response = {
            data: {
                'token': token
            }
        };

        $token.setToken(response);

        expect($token).to.respondTo('getClaim');
        expect($token.getClaim()).to.eql(claim);
    });

    it('should be able to remove token from the storage', function() {
        expect($token).to.respondTo('removeToken');

        $token.removeToken();

        expect($token.getToken()).to.be.undefined;
    });

});