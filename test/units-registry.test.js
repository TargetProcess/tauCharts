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

        it('should reg and create element with inheritance', function () {

            var actions = [];
            registry.reg('Base-A',
                function () {
                    this.defineGrammarModel = () => {
                        actions.push('init');
                    };
                    this.draw = () => {
                        actions.push('draw');
                    };
                });

            registry.reg('a',
                {
                    type: 'A'
                },
                'Base-A'
            );

            var inst = registry.create('a', {});
            inst.defineGrammarModel();
            inst.draw();
            expect(actions).to.deep.equal(['init', 'draw']);
        });

        it('should reg and create element with overriden methods', function () {

            var actions = [];
            registry.reg('Base-A',
                function () {
                    this.defineGrammarModel = () => {
                        actions.push('init');
                    };
                    this.draw = () => {
                        actions.push('draw');
                    };
                });

            registry.reg('a',
                {
                    type: 'A',
                    defineGrammarModel() {
                        actions.push('init(A)');
                        this.node().defineGrammarModel();
                    },
                    draw() {
                        actions.push('draw(A)');
                        this.node().draw();
                    }
                },
                'Base-A'
            );

            var inst = registry.create('a', {});
            inst.defineGrammarModel();
            inst.draw();
            expect(actions).to.deep.equal(['init(A)', 'init', 'draw(A)', 'draw']);
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
