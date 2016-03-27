'use strict';

describe('ngAA:Controller:AuthCtrl', function() {

    var AuthCtrl;
    var scope;
    var httpBackend;
    var claim;
    var token;
    var authProvider;
    var stateProvider;

    // load ngAA module
    /// and inject ngAA $authProvider
    beforeEach(function() {
        module('ngAA', function($authProvider, $stateProvider) {
            authProvider = $authProvider;
            stateProvider = $stateProvider;
        });
    });


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

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $httpBackend) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        AuthCtrl = $controller('ngAAAuthCtrl', {
            $scope: scope
        });
    }));

    it('should be able to signin user', inject(function($rootScope, $state, ngAAUser) {
        authProvider.httpInterceptor = false;
        authProvider.signinUrl = '/signin';
        authProvider.profileKey = 'user';
        authProvider.tokenName = 'token';
        authProvider.afterSigninRedirectTo = 'home';

        stateProvider
            .state('home', {
                template: '<h1>Home</h1>',
            });

        var signin = false;

        //watch for signoutSuccess event
        var signinSuccessEmitted = false;
        $rootScope.$on('signinSuccess', function() {
            signinSuccessEmitted = true;
            signin = true;
        });

        httpBackend
            .whenPOST(authProvider.signinUrl)
            .respond(function( /*method, url, data, headers*/ ) {
                return [200, {
                    token: token,
                    user: user
                }, {}];
            });

        //set scope username and email
        scope.user.email = faker.internet.email();
        scope.user.password = faker.internet.password();

        expect(scope).to.respondTo('signin');
        scope.signin();

        httpBackend.flush();

        $rootScope.$apply();

        expect(signin).to.be.true;
        expect(signinSuccessEmitted).to.be.true;
        expect($state.current.name).to.equal('home');
        expect(ngAAUser.isAuthenticatedSync()).to.be.true;
    }));

});