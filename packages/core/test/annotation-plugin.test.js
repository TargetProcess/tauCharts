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
var testOnAreaSizeAnnotations = [
    {
        dim: 'y',
        val: [20, null],
        text: 'first half',
        color: 'orange',
        position: 'front'
    },
    {
        dim: 'y',
        val: [null, 40],
        text: 'second half',
        color: 'blue',
        position: 'front'
    }
];
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

describeChart(
    'annotation plugin',
    {
        type: 'bar',
        x: 'x',
        y: 'y',
        plugins: [
            annotations({items: testOnAreaSizeAnnotations}),
        ]
    },
    [
        {y: 0, x: 'category 1'},
        {y: 10, x: 'category 2'},
        {y: 100, x: 'category 3'}
    ],
    function (context) {
        it('should stretch area annotations to start and end of axis', function () {
            var chart = context.chart.getSVG();
            var annotationAreas = chart.querySelectorAll('.tau-chart__annotation-area polygon');

            expect(annotationAreas[0].points[1].y).to.equal(0);
            expect(annotationAreas[0].points[2].y).to.equal(0);

            expect(annotationAreas[1].points[0].y).to.equal(800);
            expect(annotationAreas[1].points[3].y).to.equal(800);
        });
    },
    {
        autoWidth: false
    }
);
