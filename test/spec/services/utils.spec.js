'use strict';

describe('ngAA:Service:Utils', function() {
    var $utils;

    /// inject ngAA
    beforeEach(module('ngAA'));

    // inject ngAA Utils
    beforeEach(inject(function(ngAAUtils) {
        $utils = ngAAUtils;
    }));

    it('should exist', function() {
        expect($utils).to.not.be.null;
    });

    it('should should check if array container includes an element', function(done) {
        expect($utils).to.respondTo('includes');
        expect($utils.includes([1, 2, 3], 2)).to.be.true;
        done();
    });

    it('should should check if array container includes all specified elements', function() {
        expect($utils).to.respondTo('includesAll');
        expect($utils.includesAll([1, 2, 3], [1, 2])).to.be.true;
        expect($utils.includesAll([1, 2, 3], [1, 2, 4])).to.be.false;
    });

    it('should should check if array container includes any of specified elements', function() {
        expect($utils).to.respondTo('includesAny');
        expect($utils.includesAny([1, 2, 3], [1, 2])).to.be.true;
        expect($utils.includesAny([1, 2, 3], [-1])).to.be.false;
        expect($utils.includesAny([1, 2, 3], [1, 2, 4])).to.be.true;
    });

});