define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Parallel chart', function () {

        var testData = [
            {x: 1, y: 1, color: 'red', size: 6, cc: 'USA'},
            {x: 0.5, y: 0.5, color: 'green', size: 6, cc: 'RUS'},
            {x: 2, y: 2, color: 'green', size: 8, cc: 'BLR'}
        ];

        var target;

        beforeEach(function () {
            target = document.createElement('div');
            document.body.appendChild(target);
        });

        afterEach(function () {
            target.parentNode.removeChild(target);
        });

        it('should throw if columns is not provided', function () {
            expect(function () {
                new tauChart.Chart({
                    type: 'parallel',
                    data: testData
                });
            }).to.throw('[columns] property must contain at least 2 dimensions');
        });

        it('should throw if data is not provided', function () {
            expect(function () {
                new tauChart.Chart({
                    type: 'parallel',
                    columns: ['x', 'y']
                });
            }).to.throw('[data] must be specified');
        });

        it('should draw without errors', function () {
            expect(function () {
                new tauChart.Chart({
                    type: 'parallel',
                    columns: ['x', 'y'],
                    data: testData
                });
            }).to.not.throw();
        });
    });
});