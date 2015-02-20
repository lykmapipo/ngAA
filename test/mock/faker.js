// 'use strict';
// /**
//  * Fake server for ngAA development
//  */
// angular
//     .module('ngAA.ngFaker', ['ngMockE2E'])
//     .run(function($httpBackend) {
//         function id(url) {
//             if (!url) {
//                 return 0;
//             }
//             var idx = url.split('/')[2];
//             if (!idx && idx <= 0) {
//                 return 0;
//             }
//             return idx - 1;
//         }

//         /*****************************
//          * begin fake profile backend
//          *****************************/
//         var users = [{
//             email: faker.internet.email().toLowerCase(),
//             phoneNumber: faker.phone.phoneNumber()
//         }];

//         //POST /users
//         $httpBackend
//             .whenPOST('/users')
//             .respond(function(method, url, data) {
//                 var user = data;
//                 users.push(user);
//                 return [200, {
//                     user: user
//                 }, {}];
//             });

//         //GET /users
//         $httpBackend
//             .whenGET('/users')
//             .respond(function(method, url, data) {
//                 return [200, users, {}];
//             });

//         //GET /users/:id
//         $httpBackend
//             .whenGET(/\/users\/[\d]+/, function(headers) {
//                 return headers;
//             })
//             .respond(function(method, url, data) {
//                 return [200, users[id(url)], {}];
//             });

//         //PUT /users/:id
//         $httpBackend
//             .whenPUT(/\/users\/[\d]+/)
//             .respond(function(method, url, data) {
//                 var id = id(url);
//                 users[id] = data;

//                 return [200, users[id], {}];
//             });

//         //DELETE /users/:id
//         $httpBackend
//             .whenDELETE(/\/users\/[\d]+/)
//             .respond(function(method, url, data) {
//                 var id = id(url);
//                 var profile = users[id];
//                 users.splice(id, 1);

//                 return [200, profile, {}];
//             });
//         /*****************************
//          * end fake users backend
//          *****************************/



//         //ignore views requests
//         $httpBackend
//             .whenGET(new RegExp('.html'))
//             .passThrough();
//     });