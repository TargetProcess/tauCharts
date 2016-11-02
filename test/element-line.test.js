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
                                label: 'letter',
                                color: 0,
                                guide: {
                                    color: {
                                        brewer: ['#abcdef'] // rgb(171, 205, 239)
                                    },
                                    label: {
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
            var path = lines.select('path');
            expect(str(d3.rgb(path.attr('stroke'))))
                .to
                .be
                .equal(str(d3.rgb('rgb(171, 205, 239)')), 'stroke');
            var labels = d3.selectAll('.i-role-label');
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

        it('should render brush line', function () {

            var pathValue = document
                .querySelector('.area path')
                .getAttribute('d');

            expect(pathValue).to.equal([
                'M0,500 L500,500',
                'A0,0 0 0 1 500,500',
                'L0,500',
                'A0,0 0 0 1 0,500 Z',
                'M1000,0',
                'A500,500 0 0 1 1000,1000',
                'A500,500 0 0 1 1000,0',
                'Z'
            ].join(' '), 'line with variable size');
        });
    });

    var describeChart = testUtils.describeChart;
    describeChart("Line event API",
        {
            type: 'line',
            x: 'y',
            y: 'x',
            label: 'y',
            color: 'color'
        },
        [
            {
                x: 1,
                y: "1",
                color: 'yellow'

            },
            {
                x: 2,
                y: "2",
                color: 'yellow'

            },
            {
                x: 3,
                y: "3",
                color: 'yellow'
            },
            {
                x: 3,
                y: "4",
                color: 'green'
            }
        ],
        function (context) {

            it("should support highlight event", function () {
                var svg0 = context.chart.getSVG();
                expect(svg0.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var pointNode = context.chart.select((n) => n.config.type === 'ELEMENT.LINE')[0];
                pointNode.fire('highlight', ((row) => (row.color === 'green')));

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(3);

                pointNode.fire('highlight', ((row) => null));

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg2.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart('Always show path points',
        {
            type: 'line',
            x: 'y',
            y: 'x',
            guide: {
                showAnchors: 'always'
            }
        },
        [
            {
                x: 1,
                y: 1

            },
            {
                x: 2,
                y: 2
            },
            {
                x: 3,
                y: 3
            }
        ],
        function (context) {

            it('should set larger radius to highlighted points', function () {
                var svg = context.chart.getSVG();
                var points = svg.querySelectorAll('.i-data-anchor');
                expect(points.length).to.equals(3);

                testUtils.simulateEvent('mouseover', points[1]);
                expect(Number(points[1].getAttribute('r'))).to.be.above(Number(points[0].getAttribute('r')));
                expect(Number(points[1].getAttribute('r'))).to.be.above(Number(points[2].getAttribute('r')));
                testUtils.simulateEvent('mouseout', points[1]);
                expect(Number(points[1].getAttribute('r'))).to.be.equal(Number(points[0].getAttribute('r')));
            });
        },
        {
            autoWidth: false
        }
    );
});