define(function (require) {
    var expect = require('chai').expect;
    var ScalesRegistry = require('src/scales-registry').scalesRegistry;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;

    describe('scales-registry', function () {

        it('should support reg / get methods', function () {

            var newScale = function () {};

            ScalesRegistry.reg('new-scale', newScale);
            var actualScale = ScalesRegistry.get('new-scale');

            expect(actualScale).to.equal(newScale);
        });
    });

    describe('scales-factory', function () {

        it('should support flex scales', function () {

            var data = [
                {"x1": "A", "x2": "C1", "y1": 1},
                {"x1": "A", "x2": "C2", "y1": 2},
                {"x1": "A", "x2": "C3", "y1": 3},
                {"x1": "A", "x2": "C4", "y1": 4},
                {"x1": "A", "x2": "C5", "y1": 5},
                {"x1": "A", "x2": "C6", "y1": 6},
                {"x1": "A", "x2": "C7", "y1": 7},
                {"x1": "A", "x2": "C8", "y1": 8},

                {"x1": "B", "x2": "C9", "y1": 9},
                {"x1": "B", "x2": "C10", "y1": 10}
            ];

            var f = new ScalesFactory({
                '/': {
                    dims: {
                        x1: {
                            type: 'ordinal'
                        },
                        x2: {
                            type: 'ordinal'
                        }
                    },
                    data: data
                }
            });

            var scaleFixedRatio = f.create(
                {
                    name: 'x1',
                    type: 'ordinal',
                    ratio: {
                        'A': 0.8,
                        'B': 0.2
                    },
                    source: '/',
                    dim: 'x1'
                },
                null,
                [0, 100]
            );

            expect(scaleFixedRatio('A')).to.deep.equal(60);
            expect(scaleFixedRatio('B')).to.deep.equal(10);

            expect(scaleFixedRatio.stepSize('A')).to.deep.equal(80);
            expect(scaleFixedRatio.stepSize('B')).to.deep.equal(20);


            var scaleDynamicRatio = f.create(
                {
                    name: 'x1',
                    type: 'ordinal',
                    ratio: function (key, size, varSet) {

                        var pad = 20;

                        var xHash = (keys) => {
                            return _(data)
                                .chain()
                                .map((row) => {
                                    return keys.reduce((r, k) => (r.concat(row[k])), []);
                                })
                                .uniq((t) => JSON.stringify(t))
                                .reduce((memo, t) => {
                                    var k = t[0];
                                    memo[k] = memo[k] || 0;
                                    memo[k] += 1;
                                    return memo;
                                }, {})
                                .value();
                        };

                        var xTotal = (keys) => {
                            return _.values(xHash(keys)).reduce((sum, v) => (sum + v), 0);
                        };

                        var xPart = (keys, k) => {
                            return xHash(keys)[k];
                        };

                        var facetSize = varSet.length;
                        var totalItems = xTotal(['x1', 'x2']);

                        var tickPxSize = (size - (facetSize * pad)) / totalItems;
                        var countOfTicksInTheFacet = xPart(['x1', 'x2'], key);

                        return (countOfTicksInTheFacet * tickPxSize + pad) / size;
                    },
                    source: '/',
                    dim: 'x1'
                },
                null,
                [0, 100]
            );

            expect(scaleDynamicRatio('A')).to.deep.equal(66);
            expect(scaleDynamicRatio('B')).to.deep.equal(16);

            expect(scaleDynamicRatio.stepSize('A')).to.deep.equal(68);
            expect(scaleDynamicRatio.stepSize('B')).to.deep.equal(32);
        });
    });
});
