// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var _ = require('underscore');
    var tauCharts = require('src/tau.charts');
    var testUtils = require('testUtils');

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
        //
        //console.log(JSON.stringify(r, null, 2));

        _.each(bars, function (bar, index) {
            _.each(bar.childNodes, function (el, ind) {

                if (coords[index][ind].hasOwnProperty('x')) {
                    expect(convertToFixed(attrib(el, 'x'))).to.equal(convertToFixed(coords[index][ind].x), `x (${index} / ${ind})`);
                }

                if (coords[index][ind].hasOwnProperty('y')) {
                    expect(convertToFixed(attrib(el, 'y'))).to.equal(convertToFixed(coords[index][ind].y), `y (${index} / ${ind})`);
                }

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

        var div;
        var size = {width: 1000, height: 1000};

        beforeEach(function () {
            div = document.createElement('div');
            document.body.appendChild(div);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should draw vertical stacked bar on y-measure / x-measure', function () {

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
                                guide: {prettify: false}
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
                            "x": 998.75,
                            width: 2.5,
                            "y": 400,
                            height: 600
                        },
                        {
                            "x": 998.75,
                            width: 2.5,
                            "y": 100,
                            height: 300
                        },
                        {
                            "x": 998.75,
                            width: 2.5,
                            "y": 0,
                            height: 100
                        }
                    ]
                ]);
        });

        it('should draw horizontal stacked bar on y-measure / x-measure', function () {

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
                                guide: {prettify: false}
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
                            width: 600      // 200 * 0.6
                        },
                        {
                            "y": -1.25,
                            height: 2.5,

                            "x": 600,
                            width: 300       // 200 * 0.3
                        },
                        {
                            "y": -1.25,
                            height: 2.5,

                            "x": 900,
                            width: 100       // 200 * 0.1
                        }
                    ]
                ]);
        });

        it('should draw vertical stacked bar on y-measure / x-category', function () {

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
                                guide: {prettify: false}
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
                            "x": 125,
                            "width": 250,
                            "y": 400,
                            "height": 600 // A0.6
                        },
                        {
                            "x": 125,
                            "width": 250,
                            "y": 100,
                            "height": 300 // A0.3
                        },
                        {
                            "x": 125,
                            "width": 250,
                            "y": 0,
                            "height": 100 // A0.1
                        },

                        {
                            "x": 625,
                            "width": 250,
                            "y": 100,
                            "height": 900 // B0.9
                        },
                        {
                            "x": 625,
                            "width": 250,
                            "y": 0,
                            "height": 100 // B0.1
                        }
                    ]
                ]);
        });

        it('should draw horizontal stacked bar on y-category / x-measure', function () {

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
                                guide: {prettify: false}
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
                            "x": 0,
                            "width": 545,
                            "y": 625,
                            "height": 250
                        },
                        {
                            "x": 545,
                            "width": 273,
                            "y": 625,
                            "height": 250
                        },
                        {
                            "x": 818,
                            "width": 91,
                            "y": 625,
                            "height": 250
                        },
                        {
                            "x": 0,
                            "width": 818,
                            "y": 125,
                            "height": 250
                        },
                        {
                            "x": 818,
                            "width": 91,
                            "y": 125,
                            "height": 250
                        }
                    ]
                ]);
        });

        it('should draw vertical stacked bar with color and size', function() {

            var plot = new tauCharts.Plot({
                data: [
                    {x: 'A', y: 0.60, c: 'C1', s: 100},
                    {x: 'A', y: 0.40, c: 'C2', s: 50},

                    {x: 'B', y: 1.00, c: 'C3', s: 0}
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
                                color: 'c',
                                size: 's',
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
                            "x": 125,
                            "width": 250,
                            "y": 400,
                            "height": 600,
                            "class": "color20-1"
                        }
                    ],
                    [
                        {
                            "x": 187.5,
                            "width": 125,
                            "y": 0,
                            "height": 400,
                            "class": "color20-2"
                        }
                    ],
                    [
                        {
                            "x": 750,
                            "width": 0,
                            "y": 0,
                            "height": 1000,
                            "class": "color20-3"
                        }
                    ]
                ]);
        });

        it('should throw on y-category / x-category', function() {

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
        });

        it('should throw on negative values in stacked scale', function() {

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
        });
    });
});