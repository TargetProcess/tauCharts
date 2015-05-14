// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var _ = require('underscore');
    var tauCharts = require('src/tau.charts');
    var Cartesian = require('src/elements/coords.cartesian').Cartesian;
    var StackedInterval = require('src/elements/element.interval.stacked').StackedInterval;
    var testUtils = require('testUtils');
    var unitsMap = {};
    var unitsRegistry = {
        reg: function (unitType, xUnit) {
            unitsMap[unitType] = xUnit;
            return this;
        },
        get: function (unitType) {

            if (!unitsMap.hasOwnProperty(unitType)) {
                throw new Error('Unknown unit type: ' + unitType);
            }

            return unitsMap[unitType];
        }
    };
    unitsRegistry
        .reg('COORDS.RECT', Cartesian)
        .reg('ELEMENT.INTERVAL.STACKED', StackedInterval);

    var getGroupBar = function(div) {
        return div.getElementsByClassName('i-role-bar-group');
    };
    var attrib = testUtils.attrib;

    var expectCoordsElement = function (div, expect, coords) {

        var bars = getGroupBar(div);

        var convertToFixed = function (x) {
            return parseFloat(x).toFixed(4);
        };

        //var r = [];
        //_.each(bars, function (bar, index) {
        //    _.each(bar.childNodes, function (el, ind) {
        //        r.push({
        //            x: convertToFixed(attrib(el, 'x')),
        //            width: convertToFixed(attrib(el, 'width')),
        //
        //            y: convertToFixed(attrib(el, 'y')),
        //            height: convertToFixed(attrib(el, 'height')),
        //
        //            class: attrib(el, 'class')
        //        });
        //    });
        //});

        // console.log(JSON.stringify(r, null, 2));

        _.each(bars, function (bar, index) {
            _.each(bar.childNodes, function (el, ind) {
                expect(convertToFixed(attrib(el, 'x'))).to.equal(convertToFixed(coords[index][ind].x), `x (${index} / ${ind})`);
                expect(convertToFixed(attrib(el, 'y'))).to.equal(convertToFixed(coords[index][ind].y), `y (${index} / ${ind})`);

                if (coords[index][ind].hasOwnProperty('width')) {
                    expect(convertToFixed(attrib(el, 'width')))
                        .to
                        .equal(convertToFixed(coords[index][ind].width), `width (${index} / ${ind})`);
                }

                if (coords[index][ind].hasOwnProperty('height')) {
                    expect(convertToFixed(attrib(el, 'height')))
                        .to
                        .equal(convertToFixed(coords[index][ind].height), `height (${index} / ${ind})`);
                }

                if (coords[index][ind].hasOwnProperty('class')) {
                    expect(attrib(el, 'class').indexOf(coords[index][ind].class) >= 0)
                        .to
                        .equal(true);
                }
            });
        });
    };

    describe('ELEMENT.INTERVAL.STACKED', function() {

        var size = {width:200, height:200};

        var createDiv = function () {
            var div = document.createElement('div');
            document.body.appendChild(div);
            return div;
        };

        var removeDiv = function (div) {
            div.parentNode.removeChild(div);
        };

        it('should draw vertical stacked bar on y-measure / x-measure', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {x: 1, y: 0.60},
                    {x: 1, y: 0.30},
                    {x: 1, y: 0.10}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {
                            padding: {l: 0, r: 0, t: 0, b: 0},
                            x: {hide: true, autoScale: false, min: 0, max: 1},
                            y: {hide: true, autoScale: false, min: 0, max: 1}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                x: 'x',
                                y: 'y',
                                guide: {prettify:false}
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div, size);

            expectCoordsElement(
                div,
                expect,
                [
                    [
                        {
                            "x": 198.75,
                            width: 2.5,
                            "y": 80,
                            height: 120
                        },
                        {
                            "x": 198.75,
                            width: 2.5,
                            "y": 20,
                            height: 60
                        },
                        {
                            "x": 198.75,
                            width: 2.5,
                            "y": 0,
                            height: 20
                        }
                    ]
                ]);

            removeDiv(div);
        });

        it('should draw horizontal stacked bar on y-measure / x-measure', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {y: 1, x: 0.60},
                    {y: 1, x: 0.30},
                    {y: 1, x: 0.10}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {
                            padding: {l: 0, r: 0, t: 0, b: 0},
                            x: {hide: true, autoScale: false, min: 0, max: 1},
                            y: {hide: true, autoScale: false, min: 0, max: 1}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                flip: true,
                                x: 'x',
                                y: 'y',
                                guide: {prettify:false}
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div, size);

            expectCoordsElement(
                div,
                expect,
                [
                    [
                        {
                            "y": -1.25,
                            height: 2.5,
                            "x": 0,
                            width: 120      // 200 * 0.6
                        },
                        {
                            "y": -1.25,
                            height: 2.5,

                            "x": 120,
                            width: 60       // 200 * 0.3
                        },
                        {
                            "y": -1.25,
                            height: 2.5,

                            "x": 180,
                            width: 20       // 200 * 0.1
                        }
                    ]
                ]);

            removeDiv(div);
        });

        it('should draw vertical stacked bar on y-measure / x-category', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {x: 'A', y: 0.60},
                    {x: 'A', y: 0.30},
                    {x: 'A', y: 0.10},

                    {x: 'B', y: 0.90},
                    {x: 'B', y: 0.10}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {
                            padding: {l: 0, r: 0, t: 0, b: 0},
                            x: {hide: true},
                            y: {hide: true, autoScale: false, min: 0, max: 1}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                x: 'x',
                                y: 'y',
                                guide: {prettify:false}
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div, size);

            expectCoordsElement(
                div,
                expect,
                [
                    [
                        {
                            "x": "25.0000",
                            "width": "50.0000",
                            "y": "80.0000",
                            "height": "120.0000" // A0.6
                        },
                        {
                            "x": "25.0000",
                            "width": "50.0000",
                            "y": "20.0000",
                            "height": "60.0000" // A0.3
                        },
                        {
                            "x": "25.0000",
                            "width": "50.0000",
                            "y": "0.0000",
                            "height": "20.0000" // A0.1
                        },

                        {
                            "x": "125.0000",
                            "width": "50.0000",
                            "y": "20.0000",
                            "height": "180.0000" // B0.9
                        },
                        {
                            "x": "125.0000",
                            "width": "50.0000",
                            "y": "0.0000",
                            "height": "20.0000" // B0.1
                        }
                    ]
                ]);

            removeDiv(div);
        });

        it('should draw horizontal stacked bar on y-category / x-measure', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {y: 'A', x: 0.60},
                    {y: 'A', x: 0.30},
                    {y: 'A', x: 0.10},

                    {y: 'B', x: 0.90},
                    {y: 'B', x: 0.10}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {
                            padding: {l: 0, r: 0, t: 0, b: 0},
                            x: {hide: true},
                            y: {hide: true, autoScale: false, min: 0, max: 1}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                flip: true,
                                x: 'x',
                                y: 'y',
                                guide: {prettify:false}
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div, size);

            expectCoordsElement(
                div,
                expect,
                [
                    [
                        {
                            "x": "0.0000",
                            "width": "109.0000",
                            "y": "125.0000",
                            "height": "50.0000"
                        },
                        {
                            "x": "109.0000",
                            "width": "55.0000",
                            "y": "125.0000",
                            "height": "50.0000"
                        },
                        {
                            "x": "164.0000",
                            "width": "18.0000",
                            "y": "125.0000",
                            "height": "50.0000"
                        },
                        {
                            "x": "0.0000",
                            "width": "164.0000",
                            "y": "25.0000",
                            "height": "50.0000"
                        },
                        {
                            "x": "164.0000",
                            "width": "18.0000",
                            "y": "25.0000",
                            "height": "50.0000"
                        }
                    ]
                ]);

            removeDiv(div);
        });

        it('should draw horizontal stacked bar on y-category / x-measure / + color + size', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {x: 'A', y: 0.60, c: 'C1', s: 100},
                    {x: 'A', y: 0.40, c: 'C2', s: 50},

                    {x: 'B', y: 1.00, c: 'C3', s: 100}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        color: 'c',
                        size: 's',
                        guide: {
                            padding: {l: 0, r: 0, t: 0, b: 0},
                            x: {hide: true},
                            y: {hide: true, autoScale: false, min: 0, max: 1}
                        },
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                x: 'x',
                                y: 'y',
                                guide: {prettify:false}
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div, size);

            expectCoordsElement(
                div,
                expect,
                [
                    [
                        {
                            "x": 25,
                            "width": 50,
                            "y": 80,
                            "height": 120,
                            "class": "color20-1"
                        },
                        {
                            "x": 31.0489,
                            "width": 37.9022,
                            "y": 0,
                            "height": 80,
                            "class": "color20-2"
                        },
                        {
                            "x": 125,
                            "width": 50,
                            "y": 0,
                            "height": 200,
                            "class": "color20-3"
                        }
                    ]
                ]);

            removeDiv(div);
        });

        it('should throw on y-category / x-category', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {y: 'A', x: 'X'},
                    {y: 'B', x: 'Y'}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                x: 'x',
                                y: 'y'
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });

            expect(function () {
                plot.renderTo(div, size);
            }).to.throw('Stacked field [y] should be a non-negative number');

            removeDiv(div);
        });

        it('should throw on negative values in stacked scale', function() {

            var div = createDiv();

            var plot = new tauCharts.Plot({
                data: [
                    {x: 'X', y: 0.1},
                    {x: 'X', y: -0.2},
                    {x: 'X', y: 0.9}
                ],
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.INTERVAL.STACKED',
                                x: 'x',
                                y: 'y'
                            }
                        ]
                    }
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });

            expect(function () {
                plot.renderTo(div, size);
            }).to.throw('Stacked field [y] should be a non-negative number');

            removeDiv(div);
        });
    });
});