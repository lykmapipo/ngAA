'use strict';

describe('ngAA:Directive:permits', function() {
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

    beforeEach(inject(function() {
        authProvider.profileKey = 'profile';
        authProvider.tokenName = 'token';

        var response = {
            data: {
                'token': token,
                'profile': user
            }
        };

        //set profile and token
        $token.setToken(response);
        $user.setProfile(response);

    }));

    describe('showIfHasPermit', function() {

        it('should be able not to add ng-hide if user has a given permission', inject(function($rootScope, $compile) {

            //bind show-if-has-permit directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-permit="Post:create">Create</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();

            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.false;

        }));

        it('should be able to add ng-hide if user doesnt have a given permission', inject(function($rootScope, $compile) {

            //bind show-if-has-permit directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-permit="Post">Create</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();

            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.true;

        }));

    });



    describe('showIfHasPermits', function() {

        it('should be able not to add ng-hide if user have all of the given permissions', inject(function($rootScope, $compile) {

            //bind show-if-has-permits directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-permits="Post:create, Post:delete">Manage</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();

            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.false;

        }));

        it('should be able to add ng-hide if user doesnt have all of the given permissions', inject(function($rootScope, $compile) {

            //bind show-if-has-permits directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-permits="Post:creat, Post:delet">Manage</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();

            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.true;

        }));

    });


    describe('showIfHasAnyPermits', function() {

        it('should be able not to add ng-hide if user has any of the given permissions', inject(function($rootScope, $compile) {

            //bind show-if-has-any-permit directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-any-permit="Post:create, Post:delet">Manage</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();

            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.false;

        }));

        it('should be able to add ng-hide if user doesnt have any of the given permissions', inject(function($rootScope, $compile) {

            //bind show-if-has-any-permit directive to
            //to element
            var elm = angular
                .element(
                    '<li show-if-has-any-permit="Post:creat, Post:delet">Manage</li>'
                );

            scope = $rootScope;
            $compile(elm)(scope);
            scope.$digest();


            expect(elm.hasClass('ng-scope')).to.be.true;
            expect(elm.hasClass('ng-hide')).to.be.true;

        }));

    });

});