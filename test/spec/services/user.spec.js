'use strict';

describe('ngAA:Service:User', function() {
    var authProvider;
    var httpBackend;
    var $user;
    var $token;
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
        module('ngAA', function($authProvider) {
            authProvider = $authProvider;
        });
    });

    // inject ngAA User
    beforeEach(inject(function(Token, User, $httpBackend) {
        $user = User;
        $token = Token;
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
        expect($user).to.not.be.null;
    });


    it('should be able to check if user is authenticated', inject(function($rootScope) {
        $token.removeToken();
        var isAuthenticated;
        var isNotAuthenticated;

        expect($user).to.respondTo('isAuthenticated');
        $user
            .isAuthenticated()
            .then(function(value) {
                isNotAuthenticated = value;
            });

        authProvider.tokenName = 'token';
        var response = {
            data: {
                'token': token
            }
        };


        $token.setToken(response);

        $user
            .isAuthenticated()
            .then(function(value) {
                isAuthenticated = value;
            });

        // Propagate promise resolution to 'then' functions using $apply().
        $rootScope.$apply();

        expect(isNotAuthenticated).to.be.false;
        expect(isAuthenticated).to.be.true;


    }));

    it('should be able to set user profile from response http', inject(function($rootScope) {
        authProvider.profileKey = 'profile';
        var profile;

        var response = {
            data: {
                'profile': user
            }
        };

        expect($user).to.respondTo('setProfile');

        $user.setProfile(response);

        expect($user).to.respondTo('getProfile');

        $user
            .getProfile()
            .then(function(result) {
                profile = result;
            });

        $rootScope.$apply();
        expect(profile).to.not.be.null;
        expect(profile).to.equal(user);

    }));

    it('should be able to remove user profile from the storage', inject(function($rootScope) {
        var profile;
        expect($token).to.respondTo('removeToken');

        $token.removeToken();

        $user
            .getProfile()
            .then(function(result) {
                profile = result;
            });

        $rootScope.$apply();

        expect(profile).to.be.undefined;
    }));

    it('should be able to check if user profile has a given permission', inject(function($rootScope) {
        authProvider.profileKey = 'profile';
        var hasPermission;
        var hasNoPermission;

        var response = {
            data: {
                'profile': user
            }
        };
        $user.setProfile(response);

        expect($user).to.respondTo('hasPermission');

        $user
            .hasPermission('Post:create')
            .then(function(value) {
                hasPermission = value;
            });

        $user
            .hasPermission('Comment:create')
            .then(function(value) {
                hasNoPermission = value;
            });
        // Propagate promise resolution to 'then' functions using $apply().
        $rootScope.$apply();

        expect(hasPermission).to.be.true;
        expect(hasNoPermission).to.be.false;

    }));

    it('should be able to check if user profile has all provided permissions', inject(function($rootScope) {
        authProvider.profileKey = 'profile';
        var hasPermissions;
        var hasNoPermissions;

        var response = {
            data: {
                'profile': user
            }
        };
        $user.setProfile(response);

        expect($user).to.respondTo('hasPermissions');

        $user
            .hasPermissions(['Post:create', 'Post:delete'])
            .then(function(value) {
                hasPermissions = value;
            });

        $user
            .hasPermissions(['Post:delete', 'Comment:create'])
            .then(function(value) {
                hasNoPermissions = value;
            });

        $rootScope.$apply();

        expect(hasPermissions).to.be.true;
        expect(hasNoPermissions).to.be.false;

    }));

    it('should be able to check if user profile has any of the provided permissions', inject(function($rootScope) {
        authProvider.profileKey = 'profile';
        var hasAnyPermission;
        var hasNoAnyPermission;

        var response = {
            data: {
                'profile': user
            }
        };
        $user.setProfile(response);

        expect($user).to.respondTo('hasAnyPermission');

        $user
            .hasAnyPermission(['Post:create', 'Post:delete'])
            .then(function(value) {
                hasAnyPermission = value;
            });

        $user
            .hasAnyPermission(['Post:delete', 'Comment:create'])
            .then(function(value) {
                hasNoAnyPermission = value;
            });

        $rootScope.$apply();

        expect(hasAnyPermission).to.be.true;
        expect(hasNoAnyPermission).to.be.true;

    }));

    it('should be able to signout current user', inject(function($rootScope) {
        var signout;
        var profile;

        var response = {
            data: {
                'profile': user
            }
        };
        $user.setProfile(response);

        expect($user).to.respondTo('signout');

        $user
            .signout()
            .then(function() {
                signout = true;
            });

        $user
            .getProfile()
            .then(function(result) {
                profile = result;
            });

        $rootScope.$apply();

        expect(signout).to.be.true;
        expect($token.getToken()).to.be.undefined;
        expect(profile).to.be.undefined;

    }));

    describe('User#signin', function() {

        it('should be able to handle signin errors', function() {
            authProvider.httpInterceptor = false;
            authProvider.signinUrl = '/signin';

            var rejected = false;

            httpBackend
                .whenPOST(authProvider.signinUrl)
                .respond(function( /*method, url, data, headers*/ ) {
                    return [404, {}, {}];
                });

            $user
                .signin(user)
                .catch(function() {
                    rejected = true;
                });

            httpBackend.flush();

            expect(rejected).to.be.true;
        });

        it('should be able to signin user', function() {
            authProvider.httpInterceptor = false;
            authProvider.signinUrl = '/signin';
            authProvider.profileKey = 'user';
            authProvider.tokenName = 'token';

            var signin = false;

            httpBackend
                .whenPOST(authProvider.signinUrl)
                .respond(function( /*method, url, data, headers*/ ) {
                    return [200, {
                        token: token,
                        user: user
                    }, {}];
                });

            $user
                .signin(user)
                .then(function() {
                    signin = true;
                });

            httpBackend.flush();

            expect(signin).to.be.true;
            expect($token.getToken()).to.not.be.null;
            expect($user.getProfile()).to.not.be.null;
        });

    });

});