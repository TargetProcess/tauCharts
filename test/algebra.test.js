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

    describe("operator:cross_period", function () {

        it("should generate tuples for period", function () {

            var dataFn = function () {
                return [
                    {x1: new Date('2015-01-01T00:00:00Z'), y1: 'a', z1: new Date('2014-01-01T00:00:00Z')},
                    {x1: new Date('2015-01-03T00:00:00Z'), y1: 'a', z1: new Date('2016-01-01T00:00:00Z')}
                ];
            };

            var tuples0 = algebra.cross_period(dataFn, 'x1', 'y1', 'day', null);
            expect(tuples0.length).to.equal(3);

            var tuples1 = algebra.cross_period(dataFn, 'x1', 'z1', 'day', 'year');
            expect(tuples1.length).to.equal(9);
        });
    });
});
