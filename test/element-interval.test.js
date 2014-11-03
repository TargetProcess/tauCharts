define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var assert = require('chai').assert;
    var tauChart = require('tau_modules/tau.newCharts').tauChart;
    var testUtils = require('testUtils');
    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;
    /*function generateCoordIfChangeDesign(){
     var map = [].map;
     var bars = getGroupBar();
     var coords = bars.map(function (bar) {
     var childCoords = map.call(bar.childNodes,function (el) {
     return {x: attrib(el, 'x'), y: attrib(el, 'y')};
     });
     return childCoords;
     });
     return coords;
     }*/

    var expectCoordsElement = function (expect, coords) {
        var bars = getGroupBar();
        //debugger
        _.each(bars, function (bar, index) {
            _.each(bar.childNodes, function (el, ind) {
                expect(attrib(el, 'x')).to.equal(coords[index][ind].x);
                expect(attrib(el, 'y')).to.equal(coords[index][ind].y);
            });
        });

        // expect(bars[2].childNodes.length).to.equal(0);
    };
    describe("ELEMENT.INTERVAL", function () {

        var testData = [
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: 2, color: 'yellow', size: 8},
            {x: 'c', y: 5, color: 'green', size: 8}
        ];

        var element, chart;

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
                            x: { tickAutoScale: false },
                            y: { tickAutoScale: false }
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL',
                                x: 'x',
                                flip: false,
                                y: 'y',
                                color: 'color'
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

        it("should render group bar element", function () {
            assert.ok(schemes.bar(chart.config.spec), 'spec is right');
            expect(getGroupBar().length).to.equal(3);
        });
        it("should group contain interval element", function () {
            expectCoordsElement(expect, [
                //generate with help generateCoordIfChangeDesign
                [
                    {
                        "x": "0",
                        "y": "711"
                    }
                ],
                [
                    {
                        "x": "266.66666666666663",
                        "y": "800"
                    },
                    {
                        "x": "533.3333333333334",
                        "y": "0"
                    }
                ],
                [
                    {
                        "x": "533.3333333333334",
                        "y": "533"
                    }
                ]
            ]);
        });
    });

    describe("ELEMENT.INTERVAL.FLIP", function () {

        var testData = [
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: 2, color: 'yellow', size: 8},
            {x: 'c', y: 5, color: 'green', size: 8}
        ];

        var element, chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot({
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'size',
                        y: 'color',
                        guide: {
                            x: { tickAutoScale: false },
                            y: { tickAutoScale: false }
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL',
                                x: 'x',
                                flip: true,
                                y: 'y',
                                color: 'color'
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

        it("should render group bar element", function () {
            assert.ok(schemes.bar(chart.config.spec), 'spec is right');
            expect(getGroupBar().length).to.equal(3);
        });
        it("should group contain interval element", function () {
            expectCoordsElement(expect, [
                //generate with help generateCoordIfChangeDesign
                [
                    {
                        "x": "0",
                        "y": "611"
                    }
                ],
                [
                    {
                        "x": "0",
                        "y": "700"
                    },
                    {
                        "x": "0",
                        "y": "-100"
                    }
                ],
                [
                    {
                        "x": "0",
                        "y": "433"
                    }
                ]
            ]);
        });
    });
});