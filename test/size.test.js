define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var sizeScale = require('tau_modules/elements/size').sizeScale;

    var check = function(sizeScale, samples) {
        samples.forEach(function(s) {
            var src = parseFloat(parseFloat(sizeScale(s[0])).toFixed(4));
            expect(src).to.deep.equal(s[1]);
        });
    };

    describe("size scale", function () {

        it("should support positive domain", function () {
            var samples = [
                [100, 110],
                [50, 60],
                [0, 10]
            ];

            var scale = sizeScale([0, 100], 10, 110);

            check(scale, samples);
        });

        it("should save relation between values in positive domain 10 .. 20", function () {
            var samples = [
                [20, 110],
                [10, 60]
            ];

            var scale = sizeScale([10, 20], 10, 110);

            check(scale, samples);
        });

        it("should support negative domain", function () {
            var samples = [
                [0, 110],
                [-50, 60],
                [-100, 10]
            ];

            var scale = sizeScale([-100, 0], 10, 110);

            check(scale, samples);
        });

        it("should save relation between values in negative domain -10 .. -20", function () {
            var samples = [
                [-10, 60],
                [-20, 10]
            ];

            var scale = sizeScale([-10, -20], 10, 110);

            check(scale, samples);
        });

        it("should support domain between positive and negative borders", function () {
            var samples = [
                [50, 110],
                [0, 60],
                [-50, 10]
            ];

            var scale = sizeScale([-50, 50], 10, 110);

            check(scale, samples);
        });

        it("should support fractional positive domain 0 .. 1", function () {
            var samples = [
                [1, 110],
                [0.5, 60],
                [0, 10]
            ];

            var scale = sizeScale([0, 1], 10, 110);

            check(scale, samples);
        });

        it("should save relations in fractional positive domain 0.5 .. 1", function () {
            var samples = [
                [1, 110],
                [0.5, 60]
            ];

            var scale = sizeScale([0.5, 1], 10, 110);

            check(scale, samples);
        });

        it("should support fractional domain between positive and negative borders", function () {
            var samples = [
                [0.5, 110],
                [0, 60],
                [-0.5, 10]
            ];

            var scale = sizeScale([-0.5, 0.5], 10, 110);

            check(scale, samples);
        });

        it("should save relations in fractional negative domain -0.5 .. -1", function () {
            var samples = [
                [-1, 10],
                [-0.5, 60]
            ];

            var scale = sizeScale([-0.5, -1], 10, 110);

            check(scale, samples);
        });

        it("should return max size on non-numerical domain", function () {
            var scale = sizeScale(['a', 'b'], 10, 110);
            expect(scale('a')).to.equal(110); // exists
            expect(scale(null)).to.equal(10); // non-exists
            expect(scale(-Infinity)).to.equal(110);
            expect(scale(Infinity)).to.equal(110);
        });
    });
});
