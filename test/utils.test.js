define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var utils = require('tau_modules/utils/utils').utils;

    describe("utils helper", function () {

        it("should nice domain", function () {
            var samples = [
                [[0.012, 0.092] , [0, 0.1]],
                [[1, 92]        , [-10, 100]],
                [[9, 92]        , [0, 100]],
                [[-89, 692]     , [-100, 800]],
                [[-10, 699]     , [-100, 800]],
                [[-1, 692]      , [-100, 800]],
                [[299, 699]     , [0, 750]]
            ];

            samples.forEach(function(s) {
                expect(utils.autoScale(s[0])).to.deep.equal(s[1]);
            });
        });
    });
});
