import {expect} from 'chai';
import testUtils from './utils/utils';
import annotations from '../plugins/annotations';

var describeChart = testUtils.describeChart;

var testOnSizeAnnotations = [{
    dim: 'x',
    val: 37,
    text: 'Avg',
    color: 'orange',
    position: 'front'
}];
var compareSizes = (grid, annotation, prop) => {
    expect(Math.floor(grid.getBBox()[prop])).to.equal(Math.floor(annotation.getBBox()[prop]));
};

describeChart(
    'annotation plugin',
    {
        type: 'bar',
        x: 'x',
        y: 'y',
        plugins: [
            annotations({items: testOnSizeAnnotations}),
        ]
    },
    [
        {x: 0, y: 'category 1'},
        {x: 10, y: 'category 2'},
        {x: 100, y: 'category 3'}
    ],
    function (context) {
        it('should stretch vertical annotation', function () {
            var chart = context.chart.getSVG();
            var chartGrid = chart.querySelector('.grid');
            var annotationLine = chart.querySelector('.tau-chart__annotation-line');

            compareSizes(chartGrid, annotationLine, 'height');
        });
    },
    {
        autoWidth: false
    }
);

describeChart(
    'annotation plugin',
    {
        type: 'bar',
        x: 'y',
        y: 'x',
        plugins: [
            annotations({items: testOnSizeAnnotations}),
        ]
    },
    [
        {x: 0, y: 'category 1'},
        {x: 10, y: 'category 2'},
        {x: 100, y: 'category 3'}
    ],
    function (context) {
        it('should stretch horizontal annotation', function () {
            var chart = context.chart.getSVG();
            var chartGrid = chart.querySelector('.grid');
            var annotationLine = chart.querySelector('.tau-chart__annotation-line');

            compareSizes(chartGrid, annotationLine, 'width');
        });
    },
    {
        autoWidth: false
    }
);
