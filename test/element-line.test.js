define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');

    var testUtils = require('testUtils');
    var assert = require('chai').assert;
    var getLine = testUtils.getLine;
    var attrib = testUtils.attrib;
    var tauChart = require('src/tau.charts');
    var cssClassMap = require('src/utils/css-class-map');
    describe("ELEMENT.LINE", function () {

        var testData = [
            {x: 1, y: 1, color: 'red'},
            {x: 1, y: 2, color: 'red'},
            {x: 2, y: 0.5, color: 'green'},
            {x: 2, y: 2, color: 'green'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot({
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {},
                        unit: [
                            {
                                type: 'ELEMENT.LINE',
                                color: 'color',
                                x: 'x',
                                y: 'y'
                            }
                        ]
                    }
                },
                data: testData
            });
            chart.renderTo(element, {width: 800, height: 800});
        });
        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it("should render two line element", function () {
            var lines = getLine();
            assert.ok(schemes.lineGPL(chart.getSpec()), 'spec is right');
            expect(lines.length).to.equal(2);
            assert.notEqual(attrib(lines[0], 'class'), attrib(lines[1], 'class'), 'should different class');
            assert.ok(testUtils.hasClass(lines[0],'graphical-report__line-width-5'), 'should different class');
            assert.ok(testUtils.hasClass(lines[0],'graphical-report__line-opacity-2'), 'should different class');
        });
    });
    describe("ELEMENT.LINE WITH ONE POINT", function () {

        var testData = [
            {x: 1, y: 1, color: 'red'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot({
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {},
                        unit: [
                            {
                                type: 'ELEMENT.LINE',
                                color: 'color',
                                x: 'x',
                                y: 'y'
                            }
                        ]
                    }
                },
                data: testData
            });
            chart.renderTo(element, {width: 800, height: 800});
        });
        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it("should render poin element", function () {
            var dotLines = d3.selectAll('.dot-line');
            assert.equal(dotLines.length, 1, 'should draw point');
        });
    });

    describe("ELEMENT.LINE generates class in depend on size and count line", function(){
        var assertClassByCount = function(value,index){
            expect(value).to.equal('graphical-report__line-opacity-' + index);
        };
        var assertClassByWidth = function(value,index){
            expect(value).to.equal('graphical-report__line-width-' + index);
        };
        assertClassByCount(cssClassMap.getLineClassesByCount(1),1);
        assertClassByCount(cssClassMap.getLineClassesByCount(2),2);
        assertClassByCount(cssClassMap.getLineClassesByCount(3),3);
        assertClassByCount(cssClassMap.getLineClassesByCount(4),4);
        assertClassByCount(cssClassMap.getLineClassesByCount(5),5);
        assertClassByCount(cssClassMap.getLineClassesByCount(6),5);

        assertClassByWidth(cssClassMap.getLineClassesByWidth(100),1);
        assertClassByWidth(cssClassMap.getLineClassesByWidth(160),2);
        assertClassByWidth(cssClassMap.getLineClassesByWidth(320),3);
        assertClassByWidth(cssClassMap.getLineClassesByWidth(480),4);
        assertClassByWidth(cssClassMap.getLineClassesByWidth(655),5);
        assertClassByWidth(cssClassMap.getLineClassesByWidth(1800),5);

    });

    describe("ELEMENT.LINE with text assigned", function () {

        var testData = [
            {x: -1, y: 0, color: 'red', letter: 'a'},
            {x: 0, y: 1, color: 'red', letter: 'b'},
            {x: 1, y: 0, color: 'green', letter: 'c'},
            {x: 0, y: -1, color: 'green', letter: 'd'},
            {x: 0, y: 0, color: 'yellow', letter: 'e'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot({
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {
                            x: {nice: false},
                            y: {nice: false}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.LINE',
                                x: 'x',
                                y: 'y',
                                text: 'letter',
                                guide: {
                                    color: {
                                        fill: '#abcdef' // rgb(171, 205, 239)
                                    },
                                    text: {
                                        fontColor: '#fedcba'
                                    }
                                }
                            }
                        ]
                    }
                },
                data: testData
            });
            chart.renderTo(element, {width: 800, height: 800});
        });
        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        var str = ((obj) => JSON.stringify(obj));

        it("should render line with text on each dot", function () {
            var lines = d3.selectAll('.line');
            expect(lines[0].length).to.be.equal(1);
            expect(str(d3.rgb(lines.style('fill'))))
                .to
                .be
                .equal(str(d3.rgb('rgb(171, 205, 239)')));
            var labels = d3.selectAll('.title');
            expect(labels[0].length).to.be.equal(5);
            expect(str(d3.rgb(labels.style('fill'))))
                .to
                .be
                .equal(str(d3.rgb('#fedcba')));
        });
    });

    describe('line chart with size parameter', function () {

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Chart({
                type: 'line',
                x: 'xx',
                y: 'yy',
                size: 'ss',
                guide: {
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false, min: 0, max: 4},
                    size: {minSize: 0, maxSize: 1000},
                    padding: {l: 0, r: 0, b: 0, t: 0}
                },
                settings: {
                    layoutEngine: 'NONE'
                },
                data: [
                    {xx: 0, yy: 2, ss: 0},
                    {xx: 2, yy: 2, ss: 0},
                    {xx: 4, yy: 2, ss: 100}
                ]
            });
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render polygon', function () {

            var svgPolygons = d3.selectAll('polygon')[0];

            var act = d3.select(svgPolygons[0]).attr('points');
            var pairs = act
                .split(' ')
                .map((xy) => xy.split(','))
                .map((xy) => {
                    return [
                        Math.round(parseFloat(xy[0])),
                        Math.round(parseFloat(xy[1]))
                    ];
                })
                .map((xy) => xy.join(','))
                .join(' ');

            expect(pairs)
                .to
                .deep
                .equal('0,500 500,500 1000,0 1000,1000 500,500 0,500', 'line with size');
        });
    });

    describe('broken line chart with size parameter', function () {

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: 'y',
                size: 's',
                data: [
                    {x: 1, y: 1, s: 0},
                    {x: 2, y: 1, s: 10},
                    {x: 2, y: 2, s: 100},
                    {x: 2, y: 0, s: 1000},
                    {x: 3, y: 1, s: 10000}
                ],
                guide: {
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false},
                    padding: {l: 0, r: 0, b: 0, t: 0}
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should be limited by canvas borders', function () {

            var svgPolygons = d3.selectAll('polygon')[0];

            var act = d3.select(svgPolygons[0]).attr('points');
            var pairs = act
                .split(' ')
                .map((xy) => xy.split(','))
                .map((xy) => {
                    return [
                        Math.round(parseFloat(xy[0])),
                        Math.round(parseFloat(xy[1]))
                    ];
                })
                .map((xy) => xy.join(','))
                .join(' ');

            expect(pairs)
                .to
                .deep
                .equal('0,499 498,498 501,0 507,983 992,480 1000,520 493,1000 501,1000 502,502 0,501', 'line with size');
        });
    });
});