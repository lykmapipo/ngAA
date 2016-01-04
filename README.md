ngAA
=======
[![Build Status](https://travis-ci.org/lykmapipo/ngAA.svg?branch=master)](https://travis-ci.org/lykmapipo/ngAA)

DRY authentication and authorization for angular and ui-router.
It uses [json web tokens](http://jwt.io/) and http authorization header for it authentication workflow and restrict state access by [permits](#permits).

*Note: ngAA works only with [ui-router](https://github.com/angular-ui/ui-router)*

[Demo](#demo)

## Guide

* [Install](#install)
* [Usage](#usage)
* [Authentication](#authentication)
* [Permits](#permits)
    * [`withOnly`](#withonly) 
    * [`withAll`](#withall) 
    * [`withAny`](#withany) 
* [$auth API](#auth-api)
  * [`$auth.signout`](#authsignout)
  * [`$auth.isAuthenticated`](#authisauthenticated)
  * [`$auth.isAuthenticatedSync`](#authisauthenticated)
  * [`$auth.getClaim`](#authgetclaim)
  * [`$auth.getProfile`](#authgetprofile)
  * [`$auth.hasPermission`](#authhaspermission)
  * [`$auth.hasPermissions`](#authhaspermissions)
  * [`$auth.hasAnyPermission`](#authhasanypermission)
* [Directives](#directives)
    * [`signout`](#signout) 
    * [`show-if-has-permit`](#show-if-has-permit) 
    * [`show-if-has-permits`](https://github.com/lykmapipo#show-if-has-permits) 
    * [`show-if-has-any-permit`](#show-if-has-any-permit) 
* [Configurations](#configuration)
    * [`afterSigninRedirectTo`](#aftersigninredirectto) 
    * [`afterSignoutRedirectTo`](#aftersignoutredirectto) 
    * [`signinUrl`](#signinurl) 
    * [`signinState`](#signinstate) 
    * [`signinRoute`](#signinroute) 
    * [`signinTemplateUrl`](#signintemplateurl) 
    * [`tokenPrefix`](#tokenprefix) 
    * [`tokenName`](#tokenname) 
    * [`profileKey`](#profilekey) 
    * [`storage`](#storage) 
    * [`authHeader`](#authheader)
* [Testing](#testing)
* [Development](#development)
* [Contribute](#contribute)


## Installation

### Bower Installation
```sh
$ bower install --save ngAA
```

### npm Installation
```sh
$ npm install --save ngAA
```

## Usage
- Include `ngAA` into your app index.html 
```html
<!doctype html>
<html ng-app="yourApp">
<head>
    ...
</head>
<body>
    ...

    <!-- build:js(.) scripts/vendor.js -->
    <!-- bower:js -->
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-ui-router/release/angular-ui-router.js"></script>
    <script src="bower_components/angular-jwt/dist/angular-jwt.js"></script>
    <script src="bower_components/ngstorage/ngStorage.js"></script>
    <script src="bower_components/ngAA/dist/ngAA.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js({.tmp,app}) scripts/yourApp.js -->
    <script src="scripts/app.js"></script>
    <!-- endbuild -->
</body>
</html>
```
- Define your `signin` template to be used by `ngAA` at `views/signin.html`
```html
<form ng-submit="signin()" role="form" autocomplete="off">
    <legend>Login</legend>

    <div class="form-group">
        <label for="email">Email</label>
        <input ng-model="user.email" type="email" class="form-control" id="email" placeholder="Email" required>
    </div>

    <div class="form-group">
        <label for="password">Password</label>
        <input ng-model="user.password" type="password" class="form-control" id="password" placeholder="Password">
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

- Require `ngAA` module into your angular application or module and define your redirect states 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        //configure after user signin redirect state
        $authProvider.afterSigninRedirectTo = 'contact';
        //configure after user signout redirect state
        $authProvider.afterSignoutRedirectTo = 'main';
});
```

- Define your application states and include `permits` or `authenticated` definitions to restrict access.
```js
$stateProvider
    .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        data:{
            authenticated:true //check for authenticity only
        }
    })
    .state('about', {
        url: '/about',
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        data: {
            permits: { //check for authenticity and permissions
                withOnly: 'Post:delete'
            }
        }
    })
    .state('contact', {
        url: '/contact',
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        data: {
            permits: { //check for authenticity and permissions
                withAll: ['Post:create','Post:edit']
            }
        },
        resolve: {
            profile: function($q, $auth) {
                return $auth.getProfile();
            }
        }
    });
```

- Implements your backend signin end point
`ngAA` expect you to implement your backend end point using your language of choice. It will send user credentials for signin in the following format
```js
{
    email:'user email',
    password:'password'
}
```
In return it expect the following response format
```js
{
    token:'your jwt valid token',
    user:{
        ....,
        permissions:[...]
    }
}
```

## Authentication
`ngAA` can restrict state transition to only authenticated user using `authenticated:true` state data. To ensure authenticity on state define it as below:

```js
'use strict';
angular
    .module('ngAPP', [
        'ui.router',
        'ngAA'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                data: {
                    authenticated:true
                }
            });
            ...
    });
```

## Permits
`ngAA` restrict state transition to only allowed user using `permits` state data. If there is no `permits` state data, `ngAA` wont protect the state. You should define your `permits` using one the following:

### withOnly 
Which tells `ngAA` to allow user with only provided permission to access the state. To tell `ngAA` to permit user with only one permission in your state definition, you do as bellow:
```js
'use strict';
angular
    .module('ngAPP', [
        'ui.router',
        'ngAA'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                data: {
                    permits: {
                        withOnly: 'Post:delete'
                    }
                }
            });
            ...
    });
```


### withAll 
Which tells `ngAA` to allow user with all given permissions to access the state. To tell `ngAA` to permit user with all given permissions in your state definition, you do as bellow:
```js
'use strict';
angular
    .module('ngAPP', [
        'ui.router',
        'ngAA'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                data: {
                    permits: {
                        withAll: ['Post:delete','Post:create']
                    }
                }
            });
            ...
    });
```


### withAny
Which tells `ngAA` to allow user with any of the given permissions to access the state. To tell `ngAA` to permit user with any of the given permissions in your state definition, you do as bellow:
```js
'use strict';
angular
    .module('ngAPP', [
        'ui.router',
        'ngAA'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                data: {
                    permits: {
                        withAny: ['Post:delete','Comment:delete']
                    }
                }
            });
            ...
    });
```


## $auth API
`ngAA $auth` service expose the following API to be used.

### $auth.signout
Used to signout current signin user.
```js
$auth
    .signout()
    .then(function() {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    });
```
### $auth.isAuthenticated
Used to check if user is authenticated.
```js
$auth
    .isAuthenticated()
    .then(function(isAuthenticated) {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    });
```

### $auth.isAuthenticatedSync
This is the synchronous version of `isAuthenticated`.
```js
$rootScope.isAuthenticated = $auth.isAuthenticatedSync();
```

### $auth.getClaim
Used to get current user `claim` from the token.
```js
$auth
    .getClaim()
    .then(function(claim) {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    });   
```

### $auth.getProfile
Used to get current user profile. Its highly recommended to use `getProfile` in your state resolve properties to get the current user profile.
```js
$stateProvider
    .state('contact', {
        url: '/contact',
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        data: {
            permits: {
                withOnly: 'Post:create'
            }
        },
        resolve: {
            profile: function($q, $auth) {
                return $auth.getProfile();
            }
        }
    });   
```

### $auth.hasPermission
Used to check if user has a given permission.
```js
$auth
    .hasPermission('Post:create')
    .then(function(hasPermission) {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    }); 
```

### $auth.hasPermissions
Used to check if user has all permissions
```js
$auth
    .hasPermissions(['Post:create','Post:edit'])
    .then(function(hasPermission) {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    }); 
```
    
### $auth.hasAnyPermission
Used to check if user has any of the permissions
```js
$auth
    .hasAnyPermission(['Post:create','Post:edit'])
    .then(function(hasPermission) {
        //your codes
        ...
    })
    .catch(function(error) {
        //catch errors
        ...
    }); 
```

## Directives

### signout
`ngAA` provide a `signout` directive which can be used in templates to signout the current sign-in user
```html
<li ng-show="isAuthenticated">
    <a data-signout>Signout</a>
</li>
```

### show-if-has-permit
`ngAA` provide a `show-if-has-permit` directive which can be used in templates to show or hide HTML elements when current signed in user has a given permission.
```html
<li show-if-has-any-permit="Post:delete">
    ...
</li>
```

### show-if-has-permits
`ngAA` provide a `show-if-has-permits` directive which can be used in templates to show or hide HTML elements when current signed in user has all of the provided permissions.
```html
<li show-if-has-permits="Post:view, Comment:create">
    ...
</li>
```

### show-if-has-any-permit
`ngAA` provide a `show-if-has-any-permit` directive which can be used in templates to show or hide HTML elements when current signed in user has any of the provided permissions.
```html
<li show-if-has-any-permits="Post:view, Comment:create">
    ...
</li>
```

## Configuration
Out of the box `ngAA` will work if you follow its convection. But it is also an optionated and allows you to override its configuration through its `$authProvider`. Below is the detailed configuration options that you may override

### afterSigninRedirectTo
Specify which state to redirect user after signin successfully. Default to `home`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.afterSigninRedirectTo = 'dashboard';
});
```

### afterSignoutRedirectTo
Specify to which state to redirect user after signout. Defaults to `signin`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.afterSignoutRedirectTo = 'site';
});
```

### signinUrl
Specify your backend end-point to be used by `ngAA` to signin your user. Default to `/signin`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinUrl = '/auth/signin';
});
```
### signinState
Specify signin state to be used when `ngAA` when configuring it `ngAAAuthCtrl`. Default to `signin`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinState = 'auth.signin';
});
```

### signinRoute 
Specify a signin route to be used with `ngAAAuthCtrl` internally. Default to `/signin`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinRoute = '/auth/signin';
});
```

### signinTemplateUrl
This is a required configuration which specify where you have put your user `signin` template. Default to `views/signin.html`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinTemplateUrl = 'views/auth/signin.html';
});
```

### tokenPrefix 
A prefix to be used to prefix token and user profile in storage. Default to `ngAA`. Its highly advisable to use another prefix mostly your application name. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.tokenPrefix = 'yourApp';
});
```

### tokenName
Specify which key to use to retrieve token from the json response from the backend server. Default to `token`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.tokenName = 'token';
});
```

### profileKey
Specify which key to use to retrieve user profile from the json response from the backend server. Default to `user`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.profileKey = 'profile';
});
```

### storage
Specify which storage you want to use to store user token and profile. There are only two option here, either `localStorage` or `sessionStorage` and default to `localStorage`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.storage = 'sessionStorage';
});
```

### authHeader
Http `Authorization` header to be set-ed into request header before sent to the backend. Its the one that will carry authenticity `token` and your can check it in your backend logic. Default to `Authorization`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.authHeader = 'your authorization header name';
});
```

## Testing
* Clone this repository
* Install all development dependencies
```sh
$ npm install && bower install
```
* Then run test
```sh
$ npm test
```

## Demo
`ngAA` repository has a `example` witch can lauched by
```sh
$ grunt serve
```
then supply any `email` and `password`

## Development
`ngAA` has set of useful `grunt` tasks to help you with development. By running
```sh
$ grunt
```
`ngAA` will be able watch your development environment for file changes and apply `jshint` and `karma` to the project.

## Contribute
Fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence

Copyright (c) 2015 lykmapipo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.