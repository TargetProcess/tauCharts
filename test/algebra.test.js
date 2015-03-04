define(function (require) {
    var expect = require('chai').expect;
    var algebra = require('src/algebra').FramesAlgebra;

    describe("operator:cross", function () {

        it("should generate tuples", function () {

            var dataFn = function () {
                return [
                    {x1: 'x', y1: 'y', z1: 1},
                    {x1: 'x', y1: 'y', z1: 2},
                    {x1: 'x', y1: 'y', z1: 3}
                ];
            };

            var tuples0 = algebra.cross(dataFn, 'x1', 'y1');
            expect(tuples0).to.deep.equal([
                {x1: 'x', y1: 'y'}
            ]);

            var tuples1 = algebra.cross(dataFn, 'x1', 'z1');
            expect(tuples1).to.deep.equal([
                {x1: 'x', z1: 1},
                {x1: 'x', z1: 2},
                {x1: 'x', z1: 3}
            ]);

            var tuples2 = algebra.cross(dataFn, null, 'z1');
            expect(tuples2).to.deep.equal([
                {z1: 1},
                {z1: 2},
                {z1: 3}
            ]);

            var tuples3 = algebra.cross(dataFn, 'x1', null);
            expect(tuples3).to.deep.equal([
                {x1: 'x'}
            ]);
        });

    });

    describe("operator:none", function () {

        it("should generate empty tuple", function () {

            var dataFn = function () {
                return [
                    {x1: 'x', y1: 'y', z1: 1},
                    {x1: 'x', y1: 'y', z1: 2},
                    {x1: 'x', y1: 'y', z1: 3}
                ];
            };

            var tuples0 = algebra.none(dataFn, 'x1', 'y1');
            expect(tuples0).to.deep.equal([null]);
        });

    });

    describe("operator:groupBy", function () {

        it("should generate group tuples", function () {

            var dataFn = function () {
                return [
                    {x1: 'x', y1: 'y', z1: 1},
                    {x1: 'x', y1: 'y', z1: 2},
                    {x1: 'x', y1: 'y', z1: 3}
                ];
            };

            var tuples0 = algebra.groupBy(dataFn, 'x1');
            expect(tuples0).to.deep.equal([{x1:'x'}]);

            var tuples1 = algebra.groupBy(dataFn, 'z1');
            expect(tuples1).to.deep.equal([
                {z1:1},
                {z1:2},
                {z1:3}
            ]);

            var tuples2 = algebra.groupBy(dataFn, 'some-property');
            expect(tuples2).to.deep.equal([{"some-property":undefined}]);
        });

    });
});
