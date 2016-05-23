define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var testUtils = require('testUtils');
    var assert = require('chai').assert;
    var getArea = testUtils.getArea;
    var attrib = testUtils.attrib;
    var tauChart = require('src/tau.charts');

    describe('ELEMENT.PATH', function () {

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
            chart = new tauChart.Plot({
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
                                type: 'ELEMENT.PATH',
                                x: 'x',
                                y: 'y',
                                color: 'color'
                            }
                        ]
                    }
                },
                data: testData,
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(element, {width: 1000, height: 1000});
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
        });

        it('should render two area elements', function () {

            var svgPolygons = d3.selectAll('polygon')[0];
            var x0 = 0;
            var y0 = 1000;
            var x1 = 1000;
            var y1 = 0;

            // 1 path
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal(`${x0},${y0} ${x1},${y1}`);

            // 2 path
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal(`${x0},${y1} ${x1},${y0}`);

            var paths = getArea();
            expect(paths.length).to.equal(2, 'should render two area elements');

            assert.notEqual(attrib(paths[0], 'class'), attrib(paths[1], 'class'), 'should have different classes');
            expect(testUtils.hasClass(paths[0], 'color20-1')).to.equal(true);
            expect(testUtils.hasClass(paths[1], 'color20-2')).to.equal(true);

            expect(testUtils.hasClass(paths[0], 'graphical-report__highlighted')).to.equal(false);
            expect(testUtils.hasClass(paths[0], 'graphical-report__dimmed')).to.equal(false);
            expect(testUtils.hasClass(paths[1], 'graphical-report__highlighted')).to.equal(false);
            expect(testUtils.hasClass(paths[1], 'graphical-report__dimmed')).to.equal(false);

            var pathNode = chart.select((n) => n.config.type === 'ELEMENT.PATH')[0];

            pathNode.fire('highlight', ((row) => (row.color === 'up')));

            expect(testUtils.hasClass(paths[0], 'graphical-report__highlighted')).to.equal(true);
            expect(testUtils.hasClass(paths[0], 'graphical-report__dimmed')).to.equal(false);

            expect(testUtils.hasClass(paths[1], 'graphical-report__highlighted')).to.equal(false);
            expect(testUtils.hasClass(paths[1], 'graphical-report__dimmed')).to.equal(true);

            pathNode.fire('highlight', ((row) => null));

            expect(testUtils.hasClass(paths[0], 'graphical-report__highlighted')).to.equal(false);
            expect(testUtils.hasClass(paths[0], 'graphical-report__dimmed')).to.equal(false);

            expect(testUtils.hasClass(paths[1], 'graphical-report__highlighted')).to.equal(false);
            expect(testUtils.hasClass(paths[1], 'graphical-report__dimmed')).to.equal(false);

            pathNode.fire('highlight-data-points', ((row) => (row.x === 0)));

            var highlightedDots0 = d3.selectAll('.i-data-anchor').filter(function () {
                var r = parseFloat(d3.select(this).attr('r'));
                return r === 3;
            });

            expect(highlightedDots0[0].length).to.equal(2, 'should highlight 2 data points');

            pathNode.fire('highlight-data-points', ((row) => false));

            var highlightedDots1 = d3.selectAll('.i-data-anchor').filter(function () {
                var r = parseFloat(d3.select(this).attr('r'));
                return r === 3;
            });

            expect(highlightedDots1[0].length).to.equal(0, 'should remove highlight from all points');

            var actualData;
            var polygons = d3.select('polygon')[0];
            pathNode.on('click', ((sender, e) => (actualData = e.data)));
            testUtils.simulateEvent('click', polygons[0]);
            expect(actualData.x).to.equal(0);
            expect(actualData.y).to.equal(0);
            expect(actualData.color).to.equal('up');
        });
    });

    describe("ELEMENT.PATH with text assigned", function () {

        var testData = [
            {x: -1, y: 0, color: 'red', letter: 'a'},
            {x: 0, y: 1, color: 'red', letter: 'b'},
            {x: 1, y: 0, color: 'green', letter: 'c'},
            {x: 0, y: -1, color: 'green', letter: 'd'}
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
                                type: 'ELEMENT.PATH',
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

        it("should render polygon with text on each angle", function () {
            var area = d3.selectAll('.area');
            expect(area[0].length).to.be.equal(1);
            expect(str(d3.rgb(area.style('fill'))))
                .to
                .be
                .equal(str(d3.rgb('rgb(171, 205, 239)')));
            var labels = d3.selectAll('.title');
            expect(labels[0].length).to.be.equal(4);
            expect(str(d3.rgb(labels.style('fill'))))
                .to
                .be
                .equal(str(d3.rgb('#fedcba')));
        });
    });
});