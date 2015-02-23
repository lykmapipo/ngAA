'use strict';

describe('ngAA:Directive:signout', function() {
    var elm;
    var scope;
    var $user;
    var $token;
    var token;
    var claim;
    var authProvider;
    var stateProvider;

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

    // load ngAA module
    /// and inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider, $stateProvider) {
            authProvider = $authProvider;
            stateProvider = $stateProvider;
        });
    });

    beforeEach(inject(function($rootScope, $compile) {

        //bind signout directtive to
        //to element
        elm = angular
            .element(
                '<a href="" data-signout>Signout</a>'
            );

        scope = $rootScope;
        $compile(elm)(scope);
        scope.$digest();
    }));

    // inject ngAA User
    beforeEach(inject(function(ngAAToken, ngAAUser) {
        $user = ngAAUser;
        $token = ngAAToken;
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

    it('should attach signout data-attribute to the element', function() {
        expect(elm.hasClass('ng-scope')).to.be.true;
        expect(elm.data('signout')).to.equal('');
    });

    it('should signout user when clicked', inject(function($rootScope, $state) {
        authProvider.profileKey = 'profile';
        authProvider.tokenName = 'token';
        authProvider.afterSignoutRedirectTo = 'signin-t';

        //watch for signoutSuccess event
        var signoutSuccessEmitted = false;
        $rootScope.$on('signoutSuccess', function() {
            signoutSuccessEmitted = true;
        });

        //define after 
        //signout 
        //redirect state
        stateProvider
            .state('signin-t', {
                template: '<h1>signin</h1>',
            });

        var response = {
            data: {
                'token': token,
                'profile': user
            }
        };

        //set profile and token
        $token.setToken(response);
        $user.setProfile(response);

        //signout by click
        elm.click();

        $rootScope.$apply();

        expect($user.isAuthenticatedSync()).to.be.false;
        expect($state.current.name).to.equal('signin-t');
        expect(signoutSuccessEmitted).to.be.true;

    }));

});