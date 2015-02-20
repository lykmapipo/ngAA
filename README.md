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
1. include the files in your app

2. require `ngAA` module into your angular application or module
```js
angular
.module('yourApp',[
'ngAA'
]);
```
