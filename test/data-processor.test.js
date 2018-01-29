import {assert, expect} from 'chai';
import {DataProcessor} from '../src/data-processor';

    describe("DataProcessor", function () {

        it("should detect functional dependency", function () {
            var data = [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 2, y: 4},
                {x: 3, y: 9},
                {x: 0, y: 0}
            ];
            var r = DataProcessor.isYFunctionOfX(data, ['x'], ['y']);
            expect(r.result).to.equal(true);
        });

        it("should detect errors in functional dependency", function () {
            var data = [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 2, y: 4},
                {x: 3, y: 9},
                {x: 1, y: 0}
            ];
            var r = DataProcessor.isYFunctionOfX(data, ['x'], ['y']);
            expect(r.result).to.equal(false);
            expect(r.error.keyX).to.equal('x');
            expect(r.error.keyY).to.equal('y');
            expect(r.error.valX).to.equal('1');
            expect(r.error.errY).to.deep.equal(['1', '0']);
        });

        it("should detect functional dependency for facet sets", function () {
            var data = [
                {x: 0, y: 0, color: 'A'},
                {x: 1, y: 1, color: 'A'},
                {x: 2, y: 4, color: 'A'},

                {x: 0, y: 10, color: 'B'},
                {x: 1, y: 11, color: 'B'},
                {x: 2, y: 14, color: 'B'}
            ];
            var r = DataProcessor.isYFunctionOfX(data, ['x', 'color'], ['y']);
            expect(r.result).to.equal(true);
        });

        it("should detect errors in functional dependency for facet sets", function () {
            var data = [
                {x: 0, y: 0, color: 'A'},
                {x: 1, y: 1, color: 'A'},
                {x: 2, y: 4, color: 'A'},

                {x: 0, y: 10, color: 'B'},
                {x: 1, y: 11, color: 'B'},
                {x: 2, y: 14, color: 'B'},

                {x: 2, y: 44, color: 'B'}
            ];
            var r = DataProcessor.isYFunctionOfX(data, ['x', 'color'], ['y']);
            expect(r.result).to.equal(false);
            expect(r.error.keyX).to.equal('x/color');
            expect(r.error.valX).to.equal('2/B');

            expect(r.error.keyY).to.equal('y');
            expect(r.error.errY).to.deep.equal(['14', '44']);
        });

        it("should detect errors in functional dependency for facet sets (complex values)", function () {
            var data = [
                {x: 0, y: 0, color: 'A'},
                {x: 1, y: 1, color: 'A'},
                {x: 2, y: 4, color: 'A'},

                {x: 0, y: 10, color: 'B'},
                {x: 1, y: 11, color: 'B'},
                {x: 2, y: 14, color: 'B'},

                {x: 2, y: 44, color: 'B'}
            ]
                .map(function(o) {
                    var x = o.x;
                    var y = o.y;
                    var c = o.color;

                    return {
                        x: { id: x, name: 'text' + x },
                        y: { id: y, name: 'text' + y },
                        color: { id: c, name: 'text' + c }
                    };
                });
            var r = DataProcessor.isYFunctionOfX(data, ['x', 'color'], ['y']);
            expect(r.result).to.equal(false);
            expect(r.error.keyX).to.equal('x/color');
            expect(r.error.valX).to.equal('{"id":2,"name":"text2"}/{"id":"B","name":"textB"}');

            expect(r.error.keyY).to.equal('y');
            expect(r.error.errY).to.deep.equal(['{"id":14,"name":"text14"}', '{"id":44,"name":"text44"}']);
        });

        it('should sort ordered category data preserving initial order', function () {
            var data = [
                {x: 'b', y: 3},
                {x: 'a', y: 0},
                {x: 'a', y: 1},
                {x: 'b', y: 4},
                {x: 'a', y: 2},
                {x: 'b', y: 5},
                {x: 'b', y: 6},
                {x: 'b', y: 7},
                {x: 'b', y: 8},
                {x: 'b', y: 9},
                {x: 'b', y: 10},
                {x: 'b', y: 11},
                {x: 'b', y: 12},
                {x: 'b', y: 13},
                {x: 'b', y: 14},
                {x: 'b', y: 15},
            ];
            const dimInfo = {
                type: 'order',
                scale: 'ordinal',
                order: ['b', 'a']
            };
            expect(DataProcessor.sortByDim(data, 'x', dimInfo).map(({y}) => y).toString()).to.equal('3,4,5,6,7,8,9,10,11,12,13,14,15,0,1,2');
        });

        it('should sort measure data preserving initial order', function () {
            var data = [
                {x: 2, y: 3},
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 2, y: 4},
                {x: 1, y: 2},
                {x: 2, y: 5},
                {x: 2, y: 6},
                {x: 2, y: 7},
                {x: 2, y: 8},
                {x: 2, y: 9},
                {x: 2, y: 10},
                {x: 2, y: 11},
                {x: 2, y: 12},
                {x: 2, y: 13},
                {x: 2, y: 14},
                {x: 2, y: 15},
            ];
            const dimInfo = {
                type: 'measure',
                scale: 'linear',
            };
            expect(DataProcessor.sortByDim(data, 'x', dimInfo).map(({y}) => y).toString()).to.equal('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15');
        });

        it('should sort time data preserving initial order', function () {
            var data = [
                {x: '2015-12-31', y: 3},
                {x: '2015-01-01', y: 0},
                {x: '2015-01-01', y: 1},
                {x: '2015-12-31', y: 4},
                {x: '2015-01-01', y: 2},
                {x: '2015-12-31', y: 5},
                {x: '2015-12-31', y: 6},
                {x: '2015-12-31', y: 7},
                {x: '2015-12-31', y: 8},
                {x: '2015-12-31', y: 9},
                {x: '2015-12-31', y: 10},
                {x: '2015-12-31', y: 11},
                {x: '2015-12-31', y: 12},
                {x: '2015-12-31', y: 13},
                {x: '2015-12-31', y: 14},
                {x: '2015-12-31', y: 15},
            ];
            const dimInfo = {
                type: 'measure',
                scale: 'time',
            };
            expect(DataProcessor.sortByDim(data, 'x', dimInfo).map(({y}) => y).toString()).to.equal('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15');
        });
    });
