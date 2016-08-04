define(function (require) {
    var expect = require('chai').expect;
    var ScalesRegistry = require('src/scales-registry').scalesRegistry;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;
    var ValueScale = require('src/scales/value').ValueScale;
    var TimeScale = require('src/scales/time').TimeScale;
    var LinearScale = require('src/scales/linear').LinearScale;
    var LogarithmicScale = require('src/scales/logarithmic').LogarithmicScale;
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

            var f = new ScalesFactory(
                ScalesRegistry.instance(),
                {
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

            var scaleFixedRatio = f
                .createScaleInfo({
                    name: 'x1',
                    type: 'ordinal',
                    ratio: {
                        'A': 0.8,
                        'B': 0.2
                    },
                    source: '/',
                    dim: 'x1'
                })
                .create([0, 100]);

            expect(scaleFixedRatio('A')).to.deep.equal(40);
            expect(scaleFixedRatio('B')).to.deep.equal(90);

            expect(scaleFixedRatio.stepSize('A')).to.deep.equal(80);
            expect(scaleFixedRatio.stepSize('B')).to.deep.equal(20);

            var scaleDynamicRatio = f
                .createScaleInfo({
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
                })
                .create([0, 100]);

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
            expect(scale.isContains('low')).to.equal(true);
            expect(scale.isContains('wow')).to.equal(false);
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

            expect(scale0.isContains(new Date('2015-04-15'))).to.equal(false);
            expect(scale0.isContains(new Date('2015-04-16'))).to.equal(true);
            expect(scale0.isContains(new Date('2015-04-18'))).to.equal(true);
            expect(scale0.isContains(new Date('2015-04-19'))).to.equal(true);
            expect(scale0.isContains(new Date('2015-04-20'))).to.equal(false);

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

            expect(scale1.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale1.stepSize()).to.equal(0);

            var scale2 = new TimeScale(
                xSrc,
                {
                    dim: 't',
                    nice: true,
                    niceInterval: 'year'
                }).create([0, 100]);

            var actualDomain = scale2.domain();

            expect(actualDomain[0].getFullYear()).to.equal(2015);
            expect(actualDomain[0].getMonth()).to.equal(0);
            expect(actualDomain[0].getDate()).to.equal(1);

            expect(actualDomain[1].getFullYear()).to.equal(2016);
            expect(actualDomain[1].getMonth()).to.equal(0);
            expect(actualDomain[1].getDate()).to.equal(1);

            expect(scale2(actualDomain[0])).to.equal(0);
            expect(scale2(actualDomain[1])).to.equal(100);

            expect(scale2.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale2.stepSize()).to.equal(0);
        });

        it('time scale with single value domain should add 1 hour range around it when nice is applied', function () {
            var myDate = new Date('2015-04-17');
            var singleRow = {i: 3, s: -3, x: 'high', t: myDate.getTime()};
            var scaleSingleValue = new TimeScale(
                {
                    part: () => [singleRow],
                    full: () => [singleRow]
                },
                {
                    dim: 't',
                    nice: true
                }).create([0, 100]);

            var oneDay = 24 * 60 * 60 * 1000;

            var interval = [
                (myDate.getTime() - oneDay),
                (myDate.getTime() + oneDay)
            ];
            var expectedRange = d3.time.scale().domain(interval).nice().domain();

            expect(scaleSingleValue.domain().map(x => x.getTime()))
                .to
                .deep
                .equal(expectedRange.map(x => x.getTime()));
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

            expect(scale1.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale1.stepSize().toFixed(4)).to.equal((100 / scale1.domain().length).toFixed(4));

            expect(scale1.isContains('2015-04-14')).to.equal(false);
            expect(scale1.isContains('2015-04-15')).to.equal(true);
            expect(scale1.isContains('2015-04-17')).to.equal(true);
            expect(scale1.isContains('2015-04-20')).to.equal(true);
            expect(scale1.isContains('2015-04-21')).to.equal(false);

            var scale2 = new PeriodScale(
                xSrc,
                {
                    dim: 't',
                    period: 'day',
                    fitToFrameByDims: []
                }).create([0, 100]);

            expect(scale2.domain().length).to.equal(3);

            expect(scale2.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale2.stepSize().toFixed(4)).to.equal((100 / scale2.domain().length).toFixed(4));

            var scale3Ratio = {};
            scale3Ratio[new Date('2015-04-17').getTime()] = 0.5;
            scale3Ratio[new Date('2015-04-16').getTime()] = 0.1;
            scale3Ratio[new Date('2015-04-19').getTime()] = 0.4;
            var scale3 = new PeriodScale(
                xSrc,
                {
                    dim: 't',
                    ratio: scale3Ratio,
                    fitToFrameByDims: []
                }).create([0, 100]);

            expect(scale3.domain().length).to.equal(3);
            expect(scale3.stepSize(new Date('2015-04-17').getTime()).toFixed(4)).to.equal((100 * 0.5).toFixed(4));
            expect(scale3.stepSize(new Date('2015-04-16')).toFixed(4)).to.equal((100 * 0.1).toFixed(4));
            expect(scale3.stepSize(new Date('2015-04-19')).toFixed(4)).to.equal((100 * 0.4).toFixed(4));

            var scale4Ratio = function (x) {

                var xDate = new Date(x);

                if (xDate.getTime() === new Date('2015-04-17').getTime()) return 0.5;
                if (xDate.getTime() === new Date('2015-04-16').getTime()) return 0.1;
                if (xDate.getTime() === new Date('2015-04-19').getTime()) return 0.4;
            };

            var scale4 = new PeriodScale(
                xSrc,
                {
                    dim: 't',
                    ratio: scale4Ratio,
                    fitToFrameByDims: []
                }).create([0, 100]);

            expect(scale4.domain().length).to.equal(3);
            expect(scale4.stepSize(new Date('2015-04-17').getTime()).toFixed(4)).to.equal((100 * 0.5).toFixed(4));
            expect(scale4.stepSize(new Date('2015-04-16')).toFixed(4)).to.equal((100 * 0.1).toFixed(4));
            expect(scale4.stepSize(new Date('2015-04-19')).toFixed(4)).to.equal((100 * 0.4).toFixed(4));

            expect(scale4(new Date('2015-04-19').getTime())).to.equal(20);
            expect(scale4(new Date('2015-04-17').getTime())).to.equal(65);
            expect(scale4(new Date('2015-04-16').getTime())).to.equal(95);
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

            expect(scale0.isContains(0)).to.equal(false);
            expect(scale0.isContains(1)).to.equal(true);
            expect(scale0.isContains(2)).to.equal(true);
            expect(scale0.isContains(3)).to.equal(true);
            expect(scale0.isContains(3.1)).to.equal(false);

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

            var scale1A = new LinearScale(
                xSrc,
                {
                    dim: 'i',
                    min: -10,
                    max: 10,
                    nice: true
                }).create([0, 100]);

            expect(scale1A.domain()).to.deep.equal([-12, 12]);
            expect(scale1A(-12)).to.equal(0);
            expect(scale1A(12)).to.equal(100);

            var scale2 = new LinearScale(
                xSrc,
                {
                    dim: 'i',
                    nice: true
                }).create([0, 100]);

            expect(scale2.domain()).to.deep.equal([0, 3.2]);
            expect(scale2(0)).to.equal(0);
            expect(scale2(-10)).to.equal(0);
            expect(scale2(3.2)).to.equal(100);
            expect(scale2(5)).to.equal(100);

            expect(scale2.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale2.stepSize()).to.equal(0);
        });

        it('should support [logarithmic] scale', function () {

            var low = 0.00125;
            var medium = 2;
            var high = 100500;
            var width = 100;
            var crossLow = -10;
            var crossHigh = 100700;
            var niceLow = 0.001;
            var niceHigh = 200000;
            var niceCrossLow = -10000;
            var niceCrossHigh = 110000;

            var dataLog10 = [
                { i: high, s: -3, x: 'high', t: new Date('2015-04-17').getTime() },
                { i: low, s: 3, x: 'low', t: new Date('2015-04-16').getTime() },
                { i: medium, s: 1, x: 'medium', t: new Date('2015-04-19').getTime() }
            ];
            var xLog10Src = {
                part: function () {
                    return dataLog10;
                },
                full: function () {
                    return dataLog10;
                }
            };

            var scale0 = new LogarithmicScale(
                xLog10Src,
                {
                    dim: 'i'
                }).create([0, width]);

            expect(scale0.domain()).to.deep.equal([low, high]);

            expect(scale0(low)).to.equal(0);
            expect(scale0(medium)).to.equal(
                Math.round((Math.log(medium) - Math.log(low)) / (Math.log(high) - Math.log(low)) * width)
            );
            expect(scale0(high)).to.equal(width);

            expect(scale0.isContains(0)).to.equal(false);
            expect(scale0.isContains(low)).to.equal(true);
            expect(scale0.isContains(medium)).to.equal(true);
            expect(scale0.isContains(high)).to.equal(true);
            expect(scale0.isContains(crossHigh)).to.equal(false);

            var scale1 = new LogarithmicScale(
                xLog10Src,
                {
                    dim: 'i',
                    nice: true
                }).create([0, width]);

            expect(scale1.domain()).to.deep.equal([niceLow, niceHigh]);
            expect(scale1(medium)).to.equal(
                Math.round((Math.log(medium) - Math.log(niceLow)) / (Math.log(niceHigh) - Math.log(niceLow)) * width)
            );

            var scale2 = new LogarithmicScale(
                xLog10Src,
                {
                    dim: 'i',
                    min: crossLow,
                    max: crossHigh
                }).create([0, width]);

            expect(scale2.domain()).to.deep.equal([crossLow, crossHigh]);
            expect(scale2(medium)).to.equal(
                Math.round(width * (medium - crossLow) / (crossHigh - crossLow))
            );
            expect(scale2(crossHigh)).to.equal(width);

            var scale3 = new LogarithmicScale(
                xLog10Src,
                {
                    dim: 'i',
                    min: crossLow,
                    max: crossHigh,
                    nice: true
                }).create([0, width]);

            expect(scale3.domain()).to.deep.equal([niceCrossLow, niceCrossHigh]);
            expect(scale3(medium)).to.equal(
                Math.round(width * (medium - niceCrossLow) / (niceCrossHigh - niceCrossLow))
            );

            expect(scale3.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale3.stepSize()).to.equal(0);
        });

        it('should support [color] scale', function () {

            var scaleEmpty = new ColorScale(
                {
                    part: function () {
                        return [];
                    },
                    full: function () {
                        return [];
                    }
                },
                {
                    dim: null,
                    order: ['low', 'medium', 'high']
                }).create();

            expect(scaleEmpty.domain()).to.deep.equal([]);
            expect(scaleEmpty('any')).to.equal('color20-1');

            var scale0 = new ColorScale(
                xSrc,
                {
                    dim: 'x',
                    order: ['low', 'medium', 'high']
                }).create();

            expect(scale0.domain()).to.deep.equal(['low', 'medium', 'high']);
            expect(scale0('low')).to.equal('color20-1');
            expect(scale0('high')).to.equal('color20-3');

            expect(scale0.isContains('high')).to.equal(true);
            expect(scale0.isContains('wwww')).to.equal(false);

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
                    minSize: 1,
                    maxSize: 10
                }).create();

            expect(scale0.domain()).to.deep.equal([1, 3]);

            expect(scale0(1)).to.equal(6.196152422706632);
            expect(scale0(2)).to.equal(8.348469228349536);
            expect(scale0(3)).to.equal(10);

            expect(scale0.isContains(0)).to.equal(false);
            expect(scale0.isContains(1)).to.equal(true);
            expect(scale0.isContains(2)).to.equal(true);
            expect(scale0.isContains(3)).to.equal(true);
            expect(scale0.isContains(4)).to.equal(false);

            var scale1 = new SizeScale(
                xSrc,
                {
                    dim: 'x',
                    maxSize: 5
                }).create();

            expect(scale1('high')).to.equal(5);
            expect(scale1('low')).to.equal(5);
            expect(scale1('medium')).to.equal(5);

            expect(scale1.isContains('high')).to.equal(false);
            expect(scale1.isContains('medium')).to.equal(false);
            expect(scale1.isContains('low')).to.equal(false);

            var scale2 = new SizeScale(
                xSrc,
                {
                    dim: 's',
                    minSize: 1,
                    maxSize: 10
                }).create();

            expect(scale2.domain()).to.deep.equal([-3, 3]);

            expect(scale2(3)).to.equal(10);
            expect(scale2(-3)).to.equal(1);

            var scale3 = new SizeScale(
                xSrc,
                {
                    dim: 's',
                    func: 'linear',
                    minSize: 0,
                    maxSize: 100
                }).create();

            expect(scale3.domain()).to.deep.equal([-3, 3]);

            expect(scale3(3)).to.equal(100);
            expect(scale3(0)).to.equal(50);
            expect(scale3(-3)).to.equal(0);
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

            expect(scale0.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale0.stepSize()).to.equal(90 / scale0.domain().length);

            expect(scale0.isContains('high')).to.equal(true);
            expect(scale0.isContains('medium')).to.equal(true);
            expect(scale0.isContains('low')).to.equal(true);
            expect(scale0.isContains('wow')).to.equal(false);

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

            expect(scale1.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale1.stepSize('low')).to.equal(100 * 0.5);
            expect(scale1.stepSize('medium')).to.equal(100 * 0.25);
            expect(scale1.stepSize('high')).to.equal(100 * 0.25);

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

            expect(scale2.hasOwnProperty('stepSize')).to.equal(true);
            expect(scale2.stepSize('low')).to.equal(100 * 0.5);
            expect(scale2.stepSize('medium')).to.equal(100 * 0.25);
            expect(scale2.stepSize('high')).to.equal(100 * 0.25);
        });

        it('should support [fill] scale (default params)', function () {

            var scale1 = new FillScale(
                xSrc,
                {
                    dim: 's'
                }).create();

            expect(scale1.domain()).to.deep.equal([-3, 3]);
            expect(scale1(-3)).to.equal('rgba(90,180,90,0.20)');
            expect(scale1(0)).to.equal('rgba(90,180,90,0.64)');
            expect(scale1(+3)).to.equal('rgba(90,180,90,1.00)');
            expect(scale1(undefined)).to.equal(undefined);

            expect(scale1.isContains(-3.1)).to.equal(false);
            expect(scale1.isContains(-3)).to.equal(true);
            expect(scale1.isContains(0)).to.equal(true);
            expect(scale1.isContains(+3.1)).to.equal(false);
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

        it('should support "nice" on [fill] scale', function () {

            var scale0 = new FillScale(
                xSrc,
                {
                    dim: 's',
                    nice: true
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

        it('should support min / max + nice on [fill] scale', function () {

            var scale0 = new FillScale(
                xSrc,
                {
                    dim: 's',
                    min: -10,
                    max: 100,
                    nice: true
                }).create();

            expect(scale0.domain()).to.deep.equal([-20, 110]);
        });

        it('should support rgb-based [color] scale nice = false', function () {

            var negPosRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:-9}, {x:101}];
                    },
                    full: function () {
                        return [{x:-9}, {x:101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: false,
                    brewer: ['#fff', '#000']
                }).create();

            expect(negPosRgbScale.domain()).to.deep.equal([-9, 101]);
            expect(negPosRgbScale(-9)).to.equal('#ffffff');
            expect(negPosRgbScale(0)).to.equal('#eaeaea');
            expect(negPosRgbScale(101)).to.equal('#000000');

            var posPosRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:9}, {x:101}];
                    },
                    full: function () {
                        return [{x:9}, {x:101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: false,
                    brewer: ['#fff', '#000']
                }).create();

            expect(posPosRgbScale.domain()).to.deep.equal([9, 101]);
            expect(posPosRgbScale(9)).to.equal('#ffffff');
            expect(posPosRgbScale(101)).to.equal('#000000');

            var negNegRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:-9}, {x:-101}];
                    },
                    full: function () {
                        return [{x:-9}, {x:-101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: false,
                    brewer: ['#fff', '#000']
                }).create();

            expect(negNegRgbScale.domain()).to.deep.equal([-101, -9]);
            expect(negNegRgbScale(-101)).to.equal('#ffffff');
            expect(negNegRgbScale(-9)).to.equal('#000000');
        });

        it('should support rgb-based [color] scale nice = true', function () {

            var negPosRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:-9}, {x:101}];
                    },
                    full: function () {
                        return [{x:-9}, {x:101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: true,
                    brewer: ['#fff', '#000']
                }).create();

            expect(negPosRgbScale.domain()).to.deep.equal([-101, 101]);
            expect(negPosRgbScale(-101)).to.equal('#ffffff');
            expect(negPosRgbScale(0)).to.equal('#808080');
            expect(negPosRgbScale(101)).to.equal('#000000');

            var posPosRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:9}, {x:101}];
                    },
                    full: function () {
                        return [{x:9}, {x:101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: true,
                    brewer: ['#fff', '#000']
                }).create();

            expect(posPosRgbScale.domain()).to.deep.equal([9, 101]);
            expect(posPosRgbScale(9)).to.equal('#ffffff');
            expect(posPosRgbScale(101)).to.equal('#000000');

            var negNegRgbScale = new ColorScale(
                {
                    part: function () {
                        return [{x:-9}, {x:-101}];
                    },
                    full: function () {
                        return [{x:-9}, {x:-101}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    nice: true,
                    brewer: ['#fff', '#000']
                }).create();

            expect(negNegRgbScale.domain()).to.deep.equal([-101, -9]);
            expect(negNegRgbScale(-101)).to.equal('#ffffff');
            expect(negNegRgbScale(-9)).to.equal('#000000');
        });

        it('should support rgb-based [color] scale with min / max specified', function () {

            var scale0 = new ColorScale(
                {
                    part: function () {
                        return [{x:0}, {x:100}];
                    },
                    full: function () {
                        return [{x:0}, {x:100}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    min: -100,
                    max: 110,
                    nice: false,
                    brewer: ['#ff0000', '#000000', '#eeeeee', '#aaaaaa', '#0000ff']
                }).create();

            expect(scale0.domain()).to.deep.equal([-100, 110]);
            expect(scale0(-100)).to.equal('#ff0000');
            expect(scale0(110)).to.equal('#0000ff');

            var scale1 = new ColorScale(
                {
                    part: function () {
                        return [{x:0}, {x:100}];
                    },
                    full: function () {
                        return [{x:0}, {x:100}];
                    }
                },
                {
                    dim: 'x',
                    dimType: 'measure',
                    min: -100,
                    max: 110,
                    nice: true,
                    brewer: ['#ff0000', '#000000', '#eeeeee', '#aaaaaa', '#0000ff']
                }).create();

            expect(scale1.domain()).to.deep.equal([-110, 110]);
            expect(scale1(-110)).to.equal('#ff0000');
            expect(scale1(0)).to.equal('#eeeeee');
            expect(scale1(110)).to.equal('#0000ff');
        });

        it('should support fixed series property in linear scale config', function () {

            var scale0 = new LinearScale(
                xSrc,
                {
                    dim: 'i'
                }).create([0, 100]);

            expect(scale0.domain()).to.deep.equal([1, 3]);
            expect(scale0(3)).to.equal(100);
            expect(scale0.isContains(2)).to.equal(true);
            expect(scale0.isContains(100)).to.equal(false);

            var scale1 = new LinearScale(
                xSrc,
                {
                    dim: 'i',
                    series: [0, 100]
                }).create([0, 100]);

            expect(scale1.domain()).to.deep.equal([0, 100]);
            expect(scale1(50)).to.equal(50);
            expect(scale1.isContains(100)).to.equal(true);
            expect(scale1.isContains(200)).to.equal(false);
        });

        it('should support fixed series property in ordinal scale config', function () {

            var scale0 = new OrdinalScale(
                xSrc,
                {
                    dim: 'x'
                }).create([0, 90]);

            expect(scale0.domain()).to.deep.equal(['high', 'low', 'medium']);

            var scale1 = new OrdinalScale(
                xSrc,
                {
                    dim: 'x',
                    series: ['A', 'B', 'C', 'D']
                }).create([0, 100]);

            expect(scale1.domain()).to.deep.equal(['A', 'B', 'C', 'D']);
            expect(scale1.isContains('A')).to.equal(true);
            expect(scale1.isContains('E')).to.equal(false);
            expect(scale1('A')).to.equal(12.5);
            expect(scale1('D')).to.equal(87.5);
        });
    });
});
