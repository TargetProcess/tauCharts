define(function (require) {
    var expect = require('chai').expect;
    var ScalesRegistry = require('src/scales-registry').scalesRegistry;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;
    var ValueScale = require('src/scales/value').ValueScale;
    var TimeScale = require('src/scales/time').TimeScale;
    var LinearScale = require('src/scales/linear').LinearScale;
    var PeriodScale = require('src/scales/period').PeriodScale;
    var ColorScale = require('src/scales/color').ColorScale;
    var SizeScale = require('src/scales/size').SizeScale;
    var OrdinalScale = require('src/scales/ordinal').OrdinalScale;
    var FillScale = require('src/scales/fill').FillScale;

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
                    fitToFrame: true,
                    source: '/',
                    dim: 'x1'
                },
                null,
                [0, 100]
            );

            expect(scaleFixedRatio('A')).to.deep.equal(40);
            expect(scaleFixedRatio('B')).to.deep.equal(90);

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

            expect(scaleDynamicRatio('A')).to.deep.equal(34);
            expect(scaleDynamicRatio('B')).to.deep.equal(84);

            expect(scaleDynamicRatio.stepSize('A')).to.deep.equal(68);
            expect(scaleDynamicRatio.stepSize('B')).to.deep.equal(32);
        });
    });

    describe('scales', function () {

        var data = [
            {i: 3, s: -3, x: 'high',     t: new Date('2015-04-17').getTime()},
            {i: 1, s: 3,  x: 'low',      t: new Date('2015-04-16').getTime()},
            {i: 2, s: 1,  x: 'medium',   t: new Date('2015-04-19').getTime()}
        ];

        var xSrc = {
            part: function () {
                return data;
            },
            full: function () {
                return data;
            }
        };

        it('should support [value] scale', function () {

            var scale = new ValueScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high']
                }).create();

            expect(scale.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale('low')).to.equal('low');
        });

        it('should support georole on [value] scale', function () {

            var scale = new ValueScale(
                xSrc,
                {
                    dim: 'x',
                    georole: 'countries'
                }).create();

            expect(scale.georole).to.equal('countries');
        });

        it('should support [time] scale', function () {

            var scale0 = new TimeScale(
                xSrc,
                {
                    dim: 't'
                }).create([0, 100]);

            expect(scale0.domain()).to.deep.equal([new Date('2015-04-16'), new Date('2015-04-19')]);

            expect(scale0(new Date('2015-04-15'))).to.equal(0);
            expect(scale0(new Date('2015-04-16'))).to.equal(0);

            expect(scale0(new Date('2015-04-19'))).to.equal(100);
            expect(scale0(new Date('2015-04-20'))).to.equal(100);

            var scale1 = new TimeScale(
                xSrc,
                {
                    dim: 't',
                    min: '2015-04-15',
                    max: '2015-04-20'
                }).create([0, 100]);

            expect(scale1.domain()).to.deep.equal([new Date('2015-04-15'), new Date('2015-04-20')]);
            expect(scale1(new Date('2015-04-15'))).to.equal(0);
            expect(scale1(new Date('2015-04-20'))).to.equal(100);
        });

        it('should support [period] scale', function () {

            var scale0 = new PeriodScale(
                xSrc,
                {
                    dim: 't',
                    period: 'day'
                }).create([0, 100]);

            // TODO: fix date inconsistency
            expect(scale0.domain().length).to.equal(4);

            var scale1 = new PeriodScale(
                xSrc,
                {
                    dim: 't',
                    min: '2015-04-15',
                    max: '2015-04-20',
                    period: 'day'
                }).create([0, 100]);

            expect(scale1.domain().length).to.equal(6);
        });

        it('should support [linear] scale', function () {

            var scale0 = new LinearScale(
                xSrc,
                {
                    dim: 'i'
                }).create([0, 100]);

            expect(scale0.domain()).to.deep.equal([1, 3]);

            expect(scale0(1)).to.equal(0);
            expect(scale0(0.5)).to.equal(0);

            expect(scale0(3)).to.equal(100);
            expect(scale0(300)).to.equal(100);

            var scale1 = new LinearScale(
                xSrc,
                {
                    dim: 'i',
                    min: -10,
                    max: 10
                }).create([0, 100]);

            expect(scale1.domain()).to.deep.equal([-10, 10]);
            expect(scale1(-10)).to.equal(0);
            expect(scale1(10)).to.equal(100);

            var scale2 = new LinearScale(
                xSrc,
                {
                    dim: 'i',
                    autoScale: true
                }).create([0, 100]);

            expect(scale2.domain()).to.deep.equal([0, 3.2]);
            expect(scale2(0)).to.equal(0);
            expect(scale2(-10)).to.equal(0);
            expect(scale2(3.2)).to.equal(100);
            expect(scale2(5)).to.equal(100);
        });

        it('should support [color] scale', function () {

            var scale0 = new ColorScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high']
                }).create();

            expect(scale0.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale0('low')).to.equal('color20-1');
            expect(scale0('high')).to.equal('color20-3');

            var scale1 = new ColorScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high'],
                    brewer: ['c1', 'c2', 'c3']
                }).create();

            expect(scale1.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale1('low')).to.equal('c1');
            expect(scale1('high')).to.equal('c3');

            var scale2 = new ColorScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high'],
                    brewer: {low: 'c1', medium:'c2', high:'c3'}
                }).create();

            expect(scale2.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale2('low')).to.equal('c1');
            expect(scale2('high')).to.equal('c3');

            var scale3 = new ColorScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high'],
                    brewer: function (v) {
                        return 'len-' + v.length;
                    }
                }).create();

            expect(scale3.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale3('low')).to.equal('len-3');
            expect(scale3('high')).to.equal('len-4');

            expect(function () {
                new ColorScale(
                    xSrc,
                    {
                        dim: 'x',
                        order: ['low', 'medium', 'high'],
                        brewer: 'string-brewer'
                    }).create();
            }).to.throw('This brewer is not supported');
        });

        it('should support [size] scale', function () {

            var scale0 = new SizeScale(
                xSrc,
                {
                    dim: 'i',
                    min: 1,
                    max: 10
                }).create();

            expect(scale0.domain()).to.deep.equal([3, 1, 2]);

            expect(scale0(1)).to.equal(6.196152422706632);
            expect(scale0(2)).to.equal(8.348469228349536);
            expect(scale0(3)).to.equal(10);

            var scale1 = new SizeScale(
                xSrc,
                {
                    dim: 'x',
                    mid: 5
                }).create();

            expect(scale1.domain()).to.deep.equal(['high', 'low', 'medium']);

            expect(scale1('high')).to.equal(5);
            expect(scale1('low')).to.equal(5);
            expect(scale1('medium')).to.equal(5);

            var scale2 = new SizeScale(
                xSrc,
                {
                    dim: 's',
                    min: 1,
                    max: 10
                }).create();

            expect(scale2.domain()).to.deep.equal([-3, 3, 1]);

            expect(scale2(3)).to.equal(10);
            expect(scale2(-3)).to.equal(1);
        });

        it('should support [ordinal] scale', function () {

            var scale0 = new OrdinalScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high']
                }).create([0, 90]);

            expect(scale0.domain()).to.deep.equal(['low', 'medium', 'high']);

            expect(scale0('low')).to.equal(15);
            expect(scale0('medium')).to.equal(45);
            expect(scale0('high')).to.equal(75);

            var scale1 = new OrdinalScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high'],
                    ratio: {
                        low: 0.5,
                        medium: 0.25,
                        high: 0.25
                    }
                }).create([0, 100]);

            expect(scale1.domain()).to.deep.equal(['low', 'medium', 'high']);

            expect(scale1('low')).to.equal(25);
            expect(scale1('medium')).to.equal(62.5);
            expect(scale1('high')).to.equal(87.5);

            var scale2 = new OrdinalScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high'],
                    ratio: function (x) {
                        var map = {
                            low: 0.5,
                            medium: 0.25,
                            high: 0.25
                        };

                        return map[x];
                    }
                }).create([0, 100]);

            expect(scale2.domain()).to.deep.equal(['low', 'medium', 'high']);

            expect(scale2('low')).to.equal(25);
            expect(scale2('medium')).to.equal(62.5);
            expect(scale2('high')).to.equal(87.5);
        });

        it('should support [fill] scale (default params)', function () {

            var scale1 = new FillScale(
                xSrc,
                {
                    dim: 's'
                }).create();

            expect(scale1.domain()).to.deep.equal([-3, 3]);
            expect(scale1(-3)).to.equal('#F5F5F5');
            expect(scale1(0)).to.equal('#A9A9A9');
            expect(scale1(+3)).to.equal('#000000');
            expect(scale1(undefined)).to.equal(undefined);
        });

        it('should support brewer on [fill] scale', function () {

            var scale0 = new FillScale(
                xSrc,
                {
                    dim: 's',
                    brewer: ['white', 'gray', 'black']
                }).create();

            expect(scale0.domain()).to.deep.equal([-3, 3]);

            expect(scale0(-3)).to.equal('white');
            expect(scale0(-1.1)).to.equal('white');

            expect(scale0(-1)).to.equal('gray');
            expect(scale0(-0.9)).to.equal('gray');
            expect(scale0(+0.9)).to.equal('gray');

            expect(scale0(+1)).to.equal('black');
            expect(scale0(+3)).to.equal('black');
        });

        it('should throw on invalid brewer for [fill] scale', function () {

            expect(function () {
                new FillScale(
                    xSrc,
                    {
                        dim: 's',
                        brewer: 'string-brewer'
                    }).create();
            }).to.throw('This brewer is not supported');
        });

        it('should support autoScale on [fill] scale', function () {

            var scale0 = new FillScale(
                xSrc,
                {
                    dim: 's',
                    autoScale: true
                }).create();

            expect(scale0.domain()).to.deep.equal([-3.5, 3.5]);
        });

        it('should support min / max on [fill] scale', function () {

            var scale0 = new FillScale(
                xSrc,
                {
                    dim: 's',
                    min: -10,
                    max: 100
                }).create();

            expect(scale0.domain()).to.deep.equal([-10, 100]);
        });
    });
});
