ngAA
=======
[![Build Status](https://travis-ci.org/lykmapipo/ngAA.svg?branch=master)](https://travis-ci.org/lykmapipo/ngAA)

[![Tips](https://img.shields.io/gratipay/lykmapipo.svg)](https://gratipay.com/lykmapipo/)

[![Support via Gratipay](https://cdn.rawgit.com/gratipay/gratipay-badge/2.3.0/dist/gratipay.svg)](https://gratipay.com/lykmapipo/)

DRY authentication and authorization for angular and ui-router.
It uses [json web tokens](http://jwt.io/) and Authorization header for most of it workflow.

*Note: ngAA works only with [ui-router](https://github.com/angular-ui/ui-router)*

[Demo](https://github.com/lykmapipo/ngAA#testing--demo--development)

## Guide

* [Install](https://github.com/lykmapipo/ngAA#install)
* [Usage](https://github.com/lykmapipo/ngAA#usage)
* [Permits definition]()
* [$auth API]()
  * [`$auth.signout`]()
  * [`$auth.isAuthenticated`]()
  * [`$auth.isAuthenticatedSync`]()
  * [`$auth.getClaim`]()
  * [`$auth.getProfile`]()
  * [`$auth.hasPermission`]()
  * [`$auth.hasPermissions`]()
  * [`$auth.hasAnyPermission`]()
 [Directives]()
 [Configurations]()


## Install
```sh
$ bower install --save ng-aa
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
    <script src="bower_components/ng-aa/dist/ngAA.js"></script>
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

- Define your application states and include `permits` defititions to restrict access
[More about application permits definitions here](ttps://github.com/lykmapipo/ngAA#permits-definition)
```js
$stateProvider
    .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .state('about', {
        url: '/about',
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        data: {
            permits: {
                withOnly: 'Post:delete'
            }
        }
    })
    .state('contact', {
        url: '/contact',
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        data: {
            permits: {
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

## Permits definition
`ngAA` restrict state transition to only allowed user using `permits` state data. `permits` expect to receive the following definition:

- `withOnly` : Which tells `ngAA` to allow user with only provided permission to access the state.
- `withAll` : Which tells `ngAA` to allow user with all given permission to access the state.
- `withAny` : Which tells `ngAA` to allow user with any of the given permission to access the state.

## $auth API
`ngAA $auth` service expose the following API to be used.

- **$auth.signout :** Used to signout current signin user.
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
- **$auth.isAuthenticated :** Used to check if user is authenticated.
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

- **$auth.isAuthenticatedSync :** This is the synchronous version of `isAuthenticated`.
```js
$rootScope.isAuthenticated = $auth.isAuthenticatedSync();
```

- **$auth.getClaim :** Used to get current user `claim` from the token.
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
- **$auth.getProfile :** Used to get current uer profile. Its highly recommended to use `getProfile` in your state resolve properties to get the current user profile.
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

- **$auth.hasPermission :** Used to check if user has a given permission.
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

- **$auth.hasPermissions :** Used to check if user has all permissions
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
    
- **$auth.hasAnyPermission :** Used to check if user has any of the permissions
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
`ngAA` provide a `signout` directive which you can use it in your templates to signout the curent singin user
```html
<li ng-show="isAuthenticated">
    <a href="" data-signout>Signout</a>
</li>
```

## Configuration
Out of the box `ngAA` will work if you follow its convection. But it is also an optionated and allows you to override its configuration through its `$authProvider`. Below is the detailed configuration options that you may override

- **afterSigninRedirectTo :** Specify which state to redirect user after signin successfully. Default to `home`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.afterSigninRedirectTo = 'dashboard';
});
```

- **afterSignoutRedirectTo :** Specify to which state to redirect user after signout. Defaults to `signin`. 
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
- **signinUrl :** Specify your backend end-point to be used by `ngAA` to signin your user. Default to `/signin`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinUrl = '/auth/signin';
});
```
- **signinState :** Specify signin state to be used when `ngAA` when configuring it `ngAAAuthCtrl`. Default to `signin`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinState = 'auth.signin';
});
```

- **signinRoute :** Specify a signin route to be used with `ngAAAuthCtrl` internally. Default to `/signin`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.signinRoute = '/auth/signin';
});
```

- **signinTemplateUrl :** This is a required configuration which specify where you have put your user `signin` template. Default to `views/signin.html`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.templateUrl = 'views/auth/signin.html';
});
```

- **tokenPrefix :** A prefix to be used to prefix token and user profile in storage. Default to `ngAA`. Its highly advisable to use onother prefix mostly your application name. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.tokenPrefix = 'yourApp';
});
```
- **tokenName :** Specify which key to use to retrieve token from the json response from the backend server. Default to `token`.
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.tokenName = 'token';
});
```

- **profileKey :** Specify which key to use to retrieve user profile from the json response from the backend server. Default to `user`. 
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.profileKey = 'profile';
});
```

- **storage** Specify which storage you want to use to store user token and profile. There are only two option here, either `localStorage` or `sessionStorage` and default to `localStorage`.
You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.storage = 'sessionStorage';
});
```

- **authHeader** Http `Authorization` header. Default to `Authorization`. You can override this default on your module config as: 
```js
angular
.module('yourApp',[
'ngAA'
])
.config(function($stateProvider, $urlRouterProvider, $authProvider) {
        $authProvider.authHeader = 'your authorization header name';
});
```

## Testing && Demo && Development

* Clone this repository

* Install all development dependencies
```sh
$ npm install && bower install
```

* Then run test
```sh
$ npm test
```

* To run demo use
```sh
$ grunt serve
```

* To watch your development use
```sh
$ grunt
```

## Contribute

Fork this repo and push in your ideas. 
Do not forget to add a bit of test(s) of what value you adding.

## Licence

Copyright (c) 2015 lykmapipo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.