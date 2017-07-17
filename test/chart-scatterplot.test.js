import {assert} from 'chai';
import schemes from './utils/schemes';
import tauChart from '../src/tau.charts';
import testUtils from './utils/utils';
import * as d3 from 'd3-selection';

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
            testUtils.destroyCharts();
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
            var radiusArr = dots.nodes().map((node) => d3.select(node).attr('r'));
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
                            minSize: 5,
                            maxSize: 22
                        }
                    }
                ]
            });
            scatter.renderTo(element, {width: 800, height: 800});

            var dots = d3.select(element).selectAll('.dot');
            assert.equal(dots.size(), 10);
            var radiusArr = dots.nodes().map((node) => d3.select(node).attr('r'));
            var r = radiusArr[0];
            assert.equal(radiusArr.every(x => x == r), true, 'all radius are equal');
        })
    });
