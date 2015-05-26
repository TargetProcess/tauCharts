define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var utils = require('src/utils/utils').utils;
    var drawUtils = require('src/utils/utils-draw').utilsDraw;

    var check = function (samples) {
        samples.forEach(function (s) {
            expect(utils.autoScale(s[0])).to.deep.equal(s[1]);
        });
    };

    describe('utils helper', function () {

        it('should expand domain up', function () {
            var samples = [
                [[0, 0.092], [0, 0.1]],
                [[0, 99]   , [0, 110]],
                [[0, 9]    , [0, 10]]
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
});
