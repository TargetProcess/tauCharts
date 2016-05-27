define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var utils = require('src/utils/utils').utils;
    var drawUtils = require('src/utils/utils-draw').utilsDraw;
    var d3_decorator_avoid_labels_collisions = require('src/utils/d3-decorators').d3_decorator_avoid_labels_collisions;

    var check = function (samples) {
        samples.forEach(function (s) {
            expect(utils.niceZeroBased(s[0])).to.deep.equal(s[1]);
        });
    };

    describe('utils helper', function () {

        it('should expand domain up', function () {
            var samples = [
                [[0, 0.092], [0, 0.1]],
                [[0, 99]   , [0, 110]],
                [[0, 9]    , [0, 10]],
                [[0, 5e-324], [0, 0.11]]
            ];

            check(samples);
        });

        it('should expand domain down', function () {
            var samples = [
                [[-0.099, 0.092], [-0.12, 0.12]],
                [[-10, 99]      , [-20, 110]],
                [[-1, 9]        , [-2, 10]]
            ];

            check(samples);
        });

        it('should add 0 by default for positive numbers', function () {
            var samples = [
                [[0.01, 0.092], [0, 0.1]],
                [[10, 99]     , [0, 110]],
                [[2, 9]       , [0, 10]]
            ];

            check(samples);
        });

        it('should add 0 by default for negative numbers', function () {
            var samples = [
                [[-0.01, -0.092], [-0.1, 0]],
                [[-10, -99]     , [-110, 0]],
                [[-2, -9]       , [-10, 0]]
            ];

            check(samples);
        });

        it('should nice domain', function () {
            var samples = [
                [[1, 2, 20, 40   ], [0, 45]],
                [[20, 23, 45, 150], [0, 160]],
                [[3], [0, 3.35]],
                [[0], [0, 0.11]],
                [[-3], [-3.05, 0]],
                [[-30, -10], [-32, 0]]
            ];

            check(samples);
        });

        var createLiveSpec = function (padding) {
            return {
                getSpec: function () {
                    return {
                        sources: {
                            '/': {
                                data: [
                                    {x1: 'a1', 'x2': 'b1'},
                                    {x1: 'a1', 'x2': 'b2'},
                                    {x1: 'a1', 'x2': 'b3'},
                                    {x1: 'a1', 'x2': 'b4'},

                                    {x1: 'a2', 'x2': 'b1'}
                                ]
                            }
                        },
                        unit: {
                            units: [
                                {
                                    guide: {padding: padding}
                                }
                            ]
                        }
                    };
                }
            };
        };

        it('should allow to create ratio function for level 2 facet (no inner padding)', function () {
            var fx = utils.generateRatioFunction(
                'x',
                ['x1', 'x2'],
                createLiveSpec());

            expect(fx('a1', 100, ['a1', 'a2'])).to.equal(0.8);
            expect(fx('a2', 100, ['a1', 'a2'])).to.equal(0.2);

            var fy = utils.generateRatioFunction(
                'y',
                ['x1', 'x2'],
                createLiveSpec({l: 0, r: 0, t: 0, b: 0}));

            expect(fy('a1', 100, ['a1', 'a2'])).to.equal(0.8);
            expect(fy('a2', 100, ['a1', 'a2'])).to.equal(0.2);
        });

        it('should allow to create ratio function for level 2 facet (inner padding)', function () {
            var fx = utils.generateRatioFunction(
                'x',
                ['x1', 'x2'],
                createLiveSpec({l: 10, r: 10, t: 0, b: 0}));

            expect(fx('a1', 100, ['a1', 'a2'])).to.equal(0.68);
            expect(fx('a2', 100, ['a1', 'a2'])).to.equal(0.32);

            var fy = utils.generateRatioFunction(
                'y',
                ['x1', 'x2'],
                createLiveSpec({l: 0, r: 0, t: 10, b: 10}));

            expect(fy('a1', 100, ['a1', 'a2'])).to.equal(0.68);
            expect(fy('a2', 100, ['a1', 'a2'])).to.equal(0.32);
        });
    });

    describe('utils-draw', function() {
        it('should support isIntersect method', function() {
            var x0 = drawUtils.isIntersect(
                0, 0, 1, 1,
                1, 0, 2, 1
            );

            expect(x0).to.equal(false);

            var x1 = drawUtils.isIntersect(
                0, 0, 1, 1,
                1, 0, 0, 1
            );

            expect(x1).to.equal(true);
        });
    });

    describe('utils.splitEvenly()', function() {

        it('should split source domain to chunks', function() {
            var x0 = utils.splitEvenly([0, 100], 5);
            expect(x0).to.deep.equal([0, 25, 50, 75, 100]);

            var x1 = utils.splitEvenly([0, 100], 3);
            expect(x1).to.deep.equal([0, 50, 100]);

            var x2 = utils.splitEvenly([-100, 100], 3);
            expect(x2).to.deep.equal([-100, 0, 100]);

            var x3 = utils.splitEvenly([-100, 100], 5);
            expect(x3).to.deep.equal([-100, -50, 0, 50, 100]);

            var x4 = utils.splitEvenly([-100, 100], 0);
            expect(x4).to.deep.equal([-100, 100]);
        });
    });

    describe('utils.extRGBColor()', function() {

        it('should extract color if value starts from # or "rgb(" or "rgba("', function() {
            expect(utils.extRGBColor('')).to.equal('');
            expect(utils.extRGBColor('#000000')).to.equal('#000000');
            expect(utils.extRGBColor('rgb(0,0,0)')).to.equal('rgb(0,0,0)');
            expect(utils.extRGBColor('rgba(0,0,0,1)')).to.equal('rgba(0,0,0,1)');
            expect(utils.extRGBColor('rgbaL(0,0,0,1)')).to.equal('');
        });
    });

    describe('utils.extCSSClass()', function() {

        it('should extract color if value starts from # or "rgb(" or "rgba("', function() {
            expect(utils.extCSSClass('')).to.equal('');
            expect(utils.extCSSClass('#000000')).to.equal('');
            expect(utils.extCSSClass('rgb(0,0,0)')).to.equal('');
            expect(utils.extCSSClass('rgba(0,0,0,1)')).to.equal('');

            expect(utils.extCSSClass('rgbaL(0,0,0,1)')).to.equal('rgbaL(0,0,0,1)', 'returns any invalid stuff');
            expect(utils.extCSSClass('zzz')).to.equal('zzz');
        });
    });

    describe('d3 decorators', function() {

        var svgNode;
        var div;

        beforeEach(function () {

            div = document.createElement('div');
            document.body.appendChild(div);

            svgNode = d3
                .select(div)
                .append('svg')
                .attr('width', 100)
                .attr('height', 100);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should support d3_decorator_avoid_labels_collisions method', function() {

            var domain = [
                'Too long name for the ordinal axis 0',
                'Too long name for the ordinal axis 1',
                'Too long name for the ordinal axis 3',
                'Too long name for the ordinal axis 4'
            ];

            var scale = d3.scale.ordinal().domain(domain).rangePoints([0, 100], 1);

            var axis = d3.svg
                .axis()
                .scale(scale)
                .orient('bottom');

            var d3Axis = svgNode.append('g').call(axis);

            var ticks = d3Axis.selectAll('.tick');
            var actBefore = [];
            ticks.each(function () {
                var d3Tick = d3.select(this);
                actBefore.push(d3Tick.selectAll('text').attr('y'));
            });
            expect(ticks[0].length).to.equal(domain.length, 'Ticks created');
            expect(actBefore).to.deep.equal(['9', '9', '9', '9'], 'text y before decorator');

            d3_decorator_avoid_labels_collisions(d3Axis, true);

            var actAfter = [];
            var lineAfter = [];
            ticks.each(function () {
                var d3Tick = d3.select(this);
                actAfter.push(d3Tick.selectAll('text').attr('y'));
                var lineRef = d3Tick.selectAll('.label-ref');
                lineAfter.push([
                    lineRef.attr('y1'),
                    lineRef.attr('y2')
                ]);
            });
            expect(ticks[0].length).to.equal(domain.length, 'Ticks created');
            expect(actAfter).to.deep.equal(['-2', '9', '20', '-2'], 'text y after decorator');
            expect(lineAfter).to.deep.equal([
                ['-3', '-10'],
                ['8', '-10'],
                ['19', '-10'],
                ['-3', '-10']
            ], 'text y after decorator');
        });
    });
});
