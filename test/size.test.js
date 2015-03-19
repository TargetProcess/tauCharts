define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var sizeScale = require('src/size').sizeScale;

    var check = function(sizeScale, samples) {
        samples.forEach(function(s) {
            var src = parseFloat(parseFloat(sizeScale(s[0])).toFixed(4));
            expect(src).to.deep.equal(s[1]);
        });
    };

    var middleRadius = 80.7107;

    describe("size scale", function () {

        it("should support positive domain", function () {
            var samples = [
                [100, 110],
                [50, middleRadius],
                [0, 10]
            ];

            var scale = sizeScale([0, 100], 10, 110);

            check(scale, samples);
        });

        it("should save relation between values in positive domain 10 .. 20", function () {
            var samples = [
                [20, 110],
                [10, middleRadius]
            ];

            var scale = sizeScale([10, 20], 10, 110);

            check(scale, samples);
        });

        it("should support negative domain", function () {
            var samples = [
                [0, 110],
                [-50, middleRadius],
                [-100, 10]
            ];

            var scale = sizeScale([-100, 0], 10, 110);

            check(scale, samples);
        });

        it("should save relation between values in negative domain -10 .. -20", function () {
            var samples = [
                [-10, middleRadius],
                [-20, 10]
            ];

            var scale = sizeScale([-10, -20], 10, 110);

            check(scale, samples);
        });

        it("should support domain between positive and negative borders", function () {
            var samples = [
                [50, 110],
                [0, middleRadius],
                [-50, 10]
            ];

            var scale = sizeScale([-50, 50], 10, 110);

            check(scale, samples);
        });

        it("should support fractional positive domain 0 .. 1", function () {
            var samples = [
                [1, 110],
                [0.5, middleRadius],
                [0, 10]
            ];

            var scale = sizeScale([0, 1], 10, 110);

            check(scale, samples);
        });

        it("should save relations in fractional positive domain 0.5 .. 1", function () {
            var samples = [
                [1, 110],
                [0.5, middleRadius]
            ];

            var scale = sizeScale([0.5, 1], 10, 110);

            check(scale, samples);
        });

        it("should support fractional domain between positive and negative borders", function () {
            var samples = [
                [0.5, 110],
                [0, middleRadius],
                [-0.5, 10]
            ];

            var scale = sizeScale([-0.5, 0.5], 10, 110);

            check(scale, samples);
        });

        it("should save relations in fractional negative domain -0.5 .. -1", function () {
            var samples = [
                [-1, 10],
                [-0.5, middleRadius]
            ];

            var scale = sizeScale([-0.5, -1], 10, 110);

            check(scale, samples);
        });

        it("should return normal size on non-numerical domain", function () {
            var scale = sizeScale(['a', 'b'], 10, 110, 55);
            expect(scale('a')).to.equal(55); // exists
            expect(scale(null)).to.equal(55); // non-exists
            expect(scale(-Infinity)).to.equal(55);
            expect(scale(Infinity)).to.equal(55);
        });

        it("should return max size for infinite value", function () {
            var scale = sizeScale([1, 2, 3], 10, 110, 55);
            expect(scale(-Infinity)).to.equal(110);
            expect(scale(Infinity)).to.equal(110);
        });
    });
});
