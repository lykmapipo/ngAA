'use strict';

describe('ngAA: AuthCtrl', function() {

    // load the controller's module
    beforeEach(module('ngAA'));

    var AuthCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        AuthCtrl = $controller('AuthCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.user.email).to.exist;
    });
});