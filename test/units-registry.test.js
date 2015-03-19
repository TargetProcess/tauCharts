define(function (require) {
    var expect = require('chai').expect;
    var registry = require('src/units-registry').unitsRegistry;

    describe('units-registry', function () {

        it('should reg and get element', function () {

            registry
                .reg('a', {type:'A'})
                .reg('b', {type:'B'});

            expect(registry.get('a')).to.deep.equal({type:'A'});
            expect(registry.get('b')).to.deep.equal({type:'B'});
        });

        it('should throw on unknown element', function () {

            registry
                .reg('a', {type:'A'})
                .reg('b', {type:'B'});

            expect(registry.get('a')).to.deep.equal({type:'A'});
            expect(() => registry.get('c')).to.throw('Unknown unit type: c');
        });
    });
});
