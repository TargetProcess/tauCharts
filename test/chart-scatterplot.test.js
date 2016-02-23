define(function (require) {
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    describe('scatter plot chart', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var scatter = new tauChart.Chart({
                type: 'scatterplot',
                data: testData,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            });
            assert.equal(schemes.scatterplotGPL.errors(scatter.getSpec()), false, 'spec right');
        })
    });

    describe('facet scatter plot chart', function () {

        var element;
        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('point size should not depend on facet segment size', function () {
            var scatter = new tauChart.Chart({
                type: 'scatterplot',
                x: ['x1'],
                y: ['y1', 'y2'],
                data: [
                    {x1: 1, y1: 'BIG', y2: 'A'},
                    {x1: 2, y1: 'BIG', y2: 'B'},
                    {x1: 3, y1: 'BIG', y2: 'C'},
                    {x1: 4, y1: 'BIG', y2: 'D'},
                    {x1: 5, y1: 'BIG', y2: 'E'},
                    {x1: 6, y1: 'BIG', y2: 'F'},
                    {x1: 7, y1: 'BIG', y2: 'G'},
                    {x1: 8, y1: 'BIG', y2: 'H'},
                    {x1: 9, y1: 'BIG', y2: 'I'},
                    {x1: 3, y1: 'SMALL', y2: 'Z'}
                ]
            });
            scatter.renderTo(element, {width: 800, height: 800});

            var dots = d3.select(element).selectAll('.dot');
            assert.equal(dots.size(), 10);
            var radiusArr = dots[0].map((node) => d3.select(node).attr('r'));
            assert.equal(radiusArr.every(x => x === radiusArr[0]), true, 'all radius are equal');
        });

        it('should allow to customize point size', function () {
            var scatter = new tauChart.Chart({
                type: 'scatterplot',
                x: ['x1'],
                y: ['y1', 'y2'],
                data: [
                    {x1: 1, y1: 'BIG', y2: 'A'},
                    {x1: 2, y1: 'BIG', y2: 'B'},
                    {x1: 3, y1: 'BIG', y2: 'C'},
                    {x1: 4, y1: 'BIG', y2: 'D'},
                    {x1: 5, y1: 'BIG', y2: 'E'},
                    {x1: 6, y1: 'BIG', y2: 'F'},
                    {x1: 7, y1: 'BIG', y2: 'G'},
                    {x1: 8, y1: 'BIG', y2: 'H'},
                    {x1: 9, y1: 'BIG', y2: 'I'},
                    {x1: 3, y1: 'SMALL', y2: 'Z'}
                ],
                guide: [
                    {},
                    {
                        size: {
                            min: 5,
                            max: 22,
                            mid: 27
                        }
                    }
                ]
            });
            scatter.renderTo(element, {width: 800, height: 800});

            var dots = d3.select(element).selectAll('.dot');
            assert.equal(dots.size(), 10);
            var radiusArr = dots[0].map((node) => d3.select(node).attr('r'));
            assert.equal(radiusArr.every(x => x == 27), true, 'all radius are equal');
        })
    });
});
