import {expect} from 'chai';
import schemes from './utils/schemes';
import testUtils from './utils/utils';
import {assert} from 'chai';
import * as d3 from 'd3-selection';
const getArea = testUtils.getArea;
const attrib = testUtils.attrib;
import tauChart from '../src/tau.charts';
const MIN_ANCHOR_RADIUS = 4;

    var createSpec = function (testData, flip = false) {
        return {
            spec: {
                unit: {
                    type: 'COORDS.RECT',
                    x: 'x',
                    y: 'y',
                    guide: {
                        x: {hide: true, nice: false},
                        y: {hide: true, nice: false},
                        padding: {l: 0, r: 0, b: 0, t: 0}
                    },
                    unit: [
                        {
                            type: 'ELEMENT.AREA',
                            x: 'x',
                            y: 'y',
                            color: 'color',
                            guide: {flip: flip}
                        }
                    ]
                }
            },
            data: testData,
            settings: {
                layoutEngine: 'NONE'
            }
        };
    };

    describe('ELEMENT.AREA', function () {

        var testData = [
            {x: 0, y: 0, color: 'up'},
            {x: 1, y: 1, color: 'up'},
            {x: 0, y: 1, color: 'down'},
            {x: 1, y: 0, color: 'down'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot(createSpec(testData));
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should support event interface', function () {

            var areas = getArea();
            expect(areas.length).to.equal(2, 'should render two area elements');

            expect(testUtils.hasClass(areas[0], 'tau-chart__highlighted')).to.equal(false);
            expect(testUtils.hasClass(areas[0], 'tau-chart__dimmed')).to.equal(false);
            expect(testUtils.hasClass(areas[1], 'tau-chart__highlighted')).to.equal(false);
            expect(testUtils.hasClass(areas[1], 'tau-chart__dimmed')).to.equal(false);

            var areaNode = chart.select((n) => n.config.type === 'ELEMENT.AREA')[0];

            areaNode.fire('highlight', ((row) => (row.color === 'up')));

            expect(testUtils.hasClass(areas[0], 'tau-chart__highlighted')).to.equal(true);
            expect(testUtils.hasClass(areas[0], 'tau-chart__dimmed')).to.equal(false);

            expect(testUtils.hasClass(areas[1], 'tau-chart__highlighted')).to.equal(false);
            expect(testUtils.hasClass(areas[1], 'tau-chart__dimmed')).to.equal(true);

            areaNode.fire('highlight', ((row) => null));

            expect(testUtils.hasClass(areas[0], 'tau-chart__highlighted')).to.equal(false);
            expect(testUtils.hasClass(areas[0], 'tau-chart__dimmed')).to.equal(false);

            expect(testUtils.hasClass(areas[1], 'tau-chart__highlighted')).to.equal(false);
            expect(testUtils.hasClass(areas[1], 'tau-chart__dimmed')).to.equal(false);

            areaNode.fire('highlight-data-points', ((row) => (row.x === 0)));

            var highlightedDots0 = d3.selectAll('.i-data-anchor').filter(function () {
                return this.getBBox().width === MIN_ANCHOR_RADIUS;
            });

            expect(highlightedDots0.size()).to.equal(2, 'should highlight 2 data points');

            areaNode.fire('highlight-data-points', ((row) => false));

            var highlightedDots1 = d3.selectAll('.i-data-anchor').filter(function () {
                var r = parseFloat(d3.select(this).attr('r'));
                return r === MIN_ANCHOR_RADIUS;
            });

            expect(highlightedDots1.size()).to.equal(0, 'should remove highlight from all points');
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            // up triangle
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,1000 1000,0 1000,1000 0,1000', 'up triangle');

            // down triangle
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('0,0 1000,1000 1000,1000 0,1000', 'down triangle');

            var areas = getArea();
            expect(areas.length).to.equal(2, 'should render two area elements');

            expect(testUtils.hasClass(areas[0], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(areas[1], 'color20-2')).to.equal(true);
        });
    });

    describe('ELEMENT.AREA min is negative', function () {

        var testData = [
            {x: 0, y: 1, color: 'up'},
            {x: 1, y: -1, color: 'up'},
            {x: 0, y: 1, color: 'down'},
            {x: 1, y: 0, color: 'down'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot(createSpec(testData));
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            // down triangle
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,0 1000,500 1000,500 0,500', 'down triangle');

            // "bantik" :)
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('0,0 1000,1000 1000,500 0,500', 'bantik');
        });
    });

    describe('ELEMENT.AREA max is negative', function () {

        var testData = [
            {x: -1, y: -1, color: 'up'},
            {x: 1, y: -2, color: 'up'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot(createSpec(testData));
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,0 1000,1000 1000,0 0,0', 'triangle to the negative area');
        });
    });

    describe('ELEMENT.AREA flipped', function () {

        var testData = [
            {x: 0, y: 0, color: 'up'},
            {x: 1, y: 1, color: 'up'},
            {x: 0, y: 1, color: 'down'},
            {x: 1, y: 0, color: 'down'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot(createSpec(testData, true));
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            // up triangle (flipped)
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,1000 1000,0 1000,1000 0,1000', 'up triangle (flipped)');

            // down triangle (flipped)
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('0,0 1000,1000 1000,1000 0,1000', 'down triangle (flipped)');

            var areas = getArea();
            expect(areas.length).to.equal(2, 'should render two area elements');

            expect(testUtils.hasClass(areas[0], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(areas[1], 'color20-2')).to.equal(true);
        });
    });

    describe('ELEMENT.AREA within ordinal / measure scales', function () {

        var testData = [
            {y: 'A', x: 0, color: 'up'},
            {y: 'B', x: 1, color: 'up'},
            {y: 'A', x: 1, color: 'down'},
            {y: 'B', x: 0, color: 'down'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot(createSpec(testData));
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            // up triangle
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,250 1000,750 1000,500 0,500', 'up triangle');

            // down triangle
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('1000,250 0,750 0,500 1000,500', 'down triangle');

            var areas = getArea();
            expect(areas.length).to.equal(2, 'should render two area elements');

            expect(testUtils.hasClass(areas[0], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(areas[1], 'color20-2')).to.equal(true);
        });
    });

    describe('area chart with split parameter', function () {

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Chart({
                type: 'area',
                x: 'xx',
                y: 'yy',
                split: 'gg',
                color: 'cc',
                guide: {
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false},
                    padding: {l: 0, r: 0, b: 0, t: 0}
                },
                settings: {
                    layoutEngine: 'NONE'
                },
                data: [
                    {xx: 0, yy: 0, gg:'A', cc: 'Blue'},
                    {xx: 1, yy: 0, gg:'A', cc: 'Blue'},

                    {xx: 0, yy: 2, gg:'B', cc: 'Blue'},
                    {xx: 1, yy: 2, gg:'B', cc: 'Blue'},

                    {xx: 0, yy: 4, gg:'B', cc: 'Green'},
                    {xx: 1, yy: 4, gg:'B', cc: 'Green'}
                ]
            });
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render area elements by split and color', function () {

            var svgPolygons = d3.selectAll('polygon').nodes();

            expect(d3.select(svgPolygons[2]).attr('points'))
                .to
                .equal('0,1000 1000,1000 1000,1000 0,1000', 'lower line');

            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('0,500 1000,500 1000,1000 0,1000', 'middle line');

            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,0 1000,0 1000,1000 0,1000', 'high line');

            var areas = getArea();
            expect(areas.length).to.equal(3, 'should render 3 area elements');

            expect(testUtils.hasClass(areas[2], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(areas[1], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(areas[0], 'color20-2')).to.equal(true);
        });
    });
