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
                [100, 100],
                [50, 58.9203],
                [10, 26.0566],
                [1, 18.6623],
                [0, 17.8407]
            ];

            var scale = sizeScale([0, 100], 100);

            check(scale, samples);
        });

        it("should support negative domain", function () {
            var samples = [
                [0, 100]
                //[-100, 17.8407]
            ];

            var scale = sizeScale([-100, 0], 100);

            check(scale, samples);
        });
    });
});
