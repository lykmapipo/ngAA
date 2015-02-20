ngAA
=======
DRY authentication and authorization for angular and ui-router.

*Current ngAA work only with [ui-router](https://github.com/angular-ui/ui-router)*

## Dependencies
- [angular](https://github.com/angular/angular.js)
- [angular-ui-router](https://github.com/angular-ui/ui-router)
- [angular-jwt](https://github.com/auth0/angular-jwt)
- [ngstorage](https://github.com/gsklee/ngStorage)

## Install
1. Bower install
```sh
bower install --save ngAA
```
## Usage
1. include the `ngAA` into your app
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

2. require `ngAA` module into your angular application or module
```js
angular
.module('yourApp',[
'ngAA'
]);
```
