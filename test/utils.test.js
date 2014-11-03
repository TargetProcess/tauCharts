define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var utils = require('tau_modules/utils/utils').utils;

    var check = function(samples) {
        samples.forEach(function(s) {
            expect(utils.autoScale(s[0])).to.deep.equal(s[1]);
        });
    };

    describe("utils helper", function () {

        it("should expand domain up", function () {
            var samples = [
                [[0, 0.092], [0, 0.1]],
                [[0, 99]   , [0, 110]],
                [[0, 9]    , [0, 10]]
            ];

            check(samples);
        });

        it("should expand domain down", function () {
            var samples = [
                [[-0.099, 0.092], [-0.12, 0.12]],
                [[-10, 99]      , [-20, 110]],
                [[-1, 9]        , [-2, 10]]
            ];

            check(samples);
        });

        it("should add 0 by default for positive numbers", function () {
            var samples = [
                [[0.01, 0.092], [0, 0.1]],
                [[10, 99]     , [0, 110]],
                [[2, 9]       , [0, 10]]
            ];

            check(samples);
        });

        it("should nice domain", function () {
            var samples = [
                [[1, 2, 20, 40   ], [0, 45]],
                [[20, 23, 45, 150], [0, 160]]
            ];

            check(samples);
        });
    });
});
