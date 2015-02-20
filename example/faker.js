'use strict';
/**
 * Fake server for ngAA development
 */
angular
    .module('ngFaker', ['ngMockE2E'])
    .run(function($httpBackend) {

        //mimic user profile that can be send with
        //backend 
        var user = {
            id: 12345,
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

        var claim = {
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            sub: user.id
        };

        var sHead = JSON.stringify({
            alg: 'HS256',
            typ: 'JWT'
        });

        //mimic token generation
        var token =
            KJUR.jws.JWS.sign(null, sHead, JSON.stringify(claim), user.id);



        //POST /signin
        $httpBackend
            .whenPOST('/signin')
            .respond(function(/**method, url, data*/) {
                return [200, {
                    user: user,
                    token: token
                }, {}];
            });


        //ignore views requests
        $httpBackend
            .whenGET(new RegExp('.html'))
            .passThrough();
    });