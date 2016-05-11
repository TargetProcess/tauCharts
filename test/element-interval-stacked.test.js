// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks

var expect = require('chai').expect;
var schemes = require('schemes');
var _ = require('underscore');
var tauCharts = require('src/tau.charts');
var testUtils = require('testUtils');
var {TauChartError, errorCodes} = require('testUtils');

var getGroupBar = function (div) {
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

describe('ELEMENT.INTERVAL.STACKED', function () {

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

        var plot = new tauCharts.Chart({
            data: [
                {x: 1, y: 0.60},
                {x: 1, y: 0.30},
                {x: 1, y: 0.10}
            ],
            type: 'stacked-bar',
            x: 'x',
            y: 'y',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true, nice: false, min: 0, max: 1},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false,
                size: {enableDistributeEvenly: false}
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
                        "x": 999.5,
                        width: 1,
                        "y": 400,
                        height: 600
                    },
                    {
                        "x": 999.5,
                        width: 1,
                        "y": 100,
                        height: 300
                    },
                    {
                        "x": 999.5,
                        width: 1,
                        "y": 0,
                        height: 100
                    }
                ]
            ]);
    });

    it('should draw horizontal stacked bar on y-measure / x-measure', function () {

        var plot = new tauCharts.Chart({
            data: [
                {y: 1, x: 0.60},
                {y: 1, x: 0.30},
                {y: 1, x: 0.10}
            ],
            type: 'horizontal-stacked-bar',
            x: 'x',
            y: 'y',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true, nice: false, min: 0, max: 1},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false,
                size: {enableDistributeEvenly: false}
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
                        "y": -0.5,
                        height: 1,
                        "x": 0,
                        width: 600      // 200 * 0.6
                    },
                    {
                        "y": -0.5,
                        height: 1,
                        "x": 600,
                        width: 300       // 200 * 0.3
                    },
                    {
                        "y": -0.5,
                        height: 1,
                        "x": 900,
                        width: 100       // 200 * 0.1
                    }
                ]
            ]);
    });

    it('should draw vertical stacked bar on y-measure / x-category', function () {

        var plot = new tauCharts.Chart({
            data: [
                {x: 'A', y: 0.60},
                {x: 'A', y: 0.30},
                {x: 'A', y: 0.10},

                {x: 'B', y: 0.90},
                {x: 'B', y: 0.10}
            ],
            type: 'stacked-bar',
            x: 'x',
            y: 'y',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false,
                size: {enableDistributeEvenly: false}
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
                        "x": 249.5,
                        "width": 1,
                        "y": 400,
                        "height": 600 // A0.6
                    },
                    {
                        "x": 249.5,
                        "width": 1,
                        "y": 100,
                        "height": 300 // A0.3
                    },
                    {
                        "x": 249.5,
                        "width": 1,
                        "y": 0,
                        "height": 100 // A0.1
                    },

                    {
                        "x": 749.5,
                        "width": 1,
                        "y": 100,
                        "height": 900 // B0.9
                    },
                    {
                        "x": 749.5,
                        "width": 1,
                        "y": 0,
                        "height": 100 // B0.1
                    }
                ]
            ]);
    });

    it('should draw horizontal stacked bar on y-category / x-measure', function () {

        var plot = new tauCharts.Chart({
            data: [
                {y: 'A', x: 0.60},
                {y: 'A', x: 0.30},
                {y: 'A', x: 0.10},

                {y: 'B', x: 0.90},
                {y: 'B', x: 0.10}
            ],
            type: 'horizontal-stacked-bar',
            x: 'x',
            y: 'y',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false,
                size: {enableDistributeEvenly: false}
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
                        "y": 749.5,
                        "height": 1
                    },
                    {
                        "x": 545,
                        "width": 273,
                        "y": 749.5,
                        "height": 1
                    },
                    {
                        "x": 818,
                        "width": 91,
                        "y": 749.5,
                        "height": 1
                    },
                    {
                        "x": 0,
                        "width": 818,
                        "y": 249.5,
                        "height": 1
                    },
                    {
                        "x": 818,
                        "width": 91,
                        "y": 249.5,
                        "height": 1
                    }
                ]
            ]);
    });

    it('should draw vertical stacked bar with color and size', function () {

        var plot = new tauCharts.Chart({
            data: [
                {x: 'A', y: 0.60, c: 'C1', s: 100},
                {x: 'A', y: 0.40, c: 'C2', s: 50},

                {x: 'B', y: 1.00, c: 'C3', s: 0}
            ],
            type: 'stacked-bar',
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false,
                size: {enableDistributeEvenly: false}
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
                        "x": 249.5,
                        "width": 1,
                        "y": 400,
                        "height": 600,
                        "class": "color20-1"
                    }
                ],
                [
                    {
                        "x": 249.6464,
                        "width": 0.7071,
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

    it('should draw vertical stacked bar with color and size + prettify', function () {

        var plot = new tauCharts.Chart({
            data: [
                {x: 'A', y: 0.60, c: 'C1', s: 100},
                {x: 'A', y: 0.40, c: 'C2', s: 50},

                {x: 'B', y: 1.00, c: 'C3', s: 0}
            ],
            type: 'stacked-bar',
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: true
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
                        "x": 230,
                        "width": 40,
                        "y": 400,
                        "height": 600,
                        "class": "color20-1"
                    }
                ],
                [
                    {
                        "x": 235.4185,
                        "width": 29.1630,
                        "y": 0,
                        "height": 400,
                        "class": "color20-2"
                    }
                ],
                [
                    {
                        "x": 748.5,
                        "width": 3,
                        "y": 0,
                        "height": 1000,
                        "class": "color20-3"
                    }
                ]
            ]);
    });

    it('should draw horizontal stacked bar with color and size + prettify', function () {

        var plot = new tauCharts.Chart({
            data: [
                {y: 'A', x: 0.60, c: 'C1', s: 100},
                {y: 'A', x: 0.40, c: 'C2', s: 50},

                {y: 'B', x: 1.00, c: 'C3', s: 0}
            ],
            type: 'horizontal-stacked-bar',
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true, nice: false, min: 0, max: 1},
                y: {hide: true},
                prettify: true
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
                        "width": 600,
                        "y": 730,
                        "height": 40,
                        "class": "color20-1"
                    }
                ],
                [
                    {
                        "x": 600,
                        "width": 400,
                        "y": 735.4185,
                        "height": 29.1630,
                        "class": "color20-2"
                    }
                ],
                [
                    {
                        "x": 0,
                        "width": 1000,
                        "y": 248.5,
                        "height": 3,
                        "class": "color20-3"
                    }
                ]
            ]);
    });

    it('should throw on y-category / x-category', function () {

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
        }).to.throw(TauChartError, /Stacked field \[y\] should be a number/);
    });

    it('should support negative values in [stacked-bar]', function () {

        var chart = new tauCharts.Chart({
            type: 'stacked-bar',
            data: [
                {x: 'A', y: -0.60, c: 'C1', s: 100},
                {x: 'A', y: -0.40, c: 'C2', s: 50},
                {x: 'B', y: 1.00, c: 'C3', s: 0}
            ],
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true},
                y: {hide: true, nice: false, min: 0, max: 1},
                prettify: false
            },
            settings: {
                layoutEngine: 'NONE'
            }
        });
        chart.renderTo(div, size);

        var width = 1000;
        var xstep = width / 2;
        var barWidth = (r) => xstep / 2 * Math.sqrt(r);
        var column = (n) => xstep * n;

        expectCoordsElement(
            div,
            expect,
            [
                [
                    {
                        "x": column(0) + (xstep - barWidth(1)) / 2,
                        "width": barWidth(1),
                        "y": 500,
                        "height": 300,
                        "class": "color20-1"
                    }
                ],
                [
                    {
                        "x": column(0) + (xstep - barWidth(0.5)) / 2,
                        "width": barWidth(0.5),
                        "y": 800,
                        "height": 200,
                        "class": "color20-2"
                    }
                ],
                [
                    {
                        "x": column(1) + (xstep - barWidth(0)) / 2,
                        "width": barWidth(0),
                        "y": 0,
                        "height": 500,
                        "class": "color20-3"
                    }
                ]
            ]);
    });

    it('should support negative values in [horizontal-stacked-bar]', function () {

        var chart = new tauCharts.Chart({
            type: 'horizontal-stacked-bar',
            data: [
                {y: 'A', x: 0.60, c: 'C1', s: 100},
                {y: 'A', x: 0.40, c: 'C2', s: 50},
                {y: 'B', x: -1.00, c: 'C3', s: 0}
            ],
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's',
            guide: {
                padding: {l: 0, r: 0, t: 0, b: 0},
                x: {hide: true, nice: false, min: 0},
                y: {hide: true}
            },
            settings: {
                layoutEngine: 'NONE'
            }
        });
        chart.renderTo(div, size);

        expectCoordsElement(
            div,
            expect,
            [
                [
                    {
                        "x": 500,
                        "width": 300,
                        "y": 730,
                        "height": 40,
                        "class": "color20-1"
                    }
                ],
                [
                    {
                        "x": 800,
                        "width": 200,
                        "y": 735.4185,
                        "height": 29.1630,
                        "class": "color20-2"
                    }
                ],
                [
                    {
                        "x": 0,
                        "width": 500,
                        "y": 248.5,
                        "height": 3,
                        "class": "color20-3"
                    }
                ]
            ]);
    });

    it('should support highlight event', function () {

        var chart = new tauCharts.Chart({
            type: 'horizontal-stacked-bar',
            data: [
                {y: 'A', x: 0.60, c: 'C1', s: 100},
                {y: 'A', x: 0.40, c: 'C2', s: 50},
                {y: 'B', x: -1.00, c: 'C3', s: 0}
            ],
            x: 'x',
            y: 'y',
            color: 'c',
            size: 's'
        });
        chart.renderTo(div, size);

        var svg0 = chart.getSVG();
        expect(svg0.querySelectorAll('.bar').length).to.equals(3);
        expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
        expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

        var intervalNode = chart.select((n) => n.config.type === 'ELEMENT.INTERVAL.STACKED')[0];
        intervalNode.fire('highlight', ((row) => (row.s > 0)));

        var svg1 = chart.getSVG();
        expect(svg1.querySelectorAll('.bar').length).to.equals(3);
        expect(svg1.querySelectorAll('.graphical-report__highlighted').length).to.equals(2);
        expect(svg1.querySelectorAll('.graphical-report__dimmed').length).to.equals(1);

        intervalNode.fire('highlight', ((row) => (null)));

        var svg2 = chart.getSVG();
        expect(svg2.querySelectorAll('.bar').length).to.equals(3);
        expect(svg2.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
        expect(svg2.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);
    });

    it('should infer color order from data by default', function () {

        var chart0 = new tauCharts.Chart({
            type: 'stacked-bar',
            data: [
                {x: 'A', y: 1, c: 'C1'},
                {x: 'A', y: 2, c: 'C2'},
                {x: 'A', y: 3, c: 'C3'}
            ],
            x: 'x',
            y: 'y',
            color: 'c'
        });
        chart0.renderTo(div, size);

        var svg0 = chart0.getSVG();
        expect(svg0.querySelectorAll('.bar').length).to.equals(3);
        var tempOrder = [];
        d3.select(svg0).selectAll('.bar')[0].forEach(function (rect) {
            var d3Rect = d3.select(rect);
            var d = d3Rect.data()[0];
            var y = d3Rect.attr('y');
            tempOrder.push({c: d.c, y: y});
        });
        var actualOrder = tempOrder.sort((a, b) => b.y - a.y).map((x) => x.c);
        expect(actualOrder).to.deep.equal(['C1', 'C2', 'C3'], 'by default order from data');
    });

    it('should take color order from dimension order if specified', function () {

        var chart0 = new tauCharts.Chart({
            dimensions: {
                c: {'type': 'category', 'scale': 'ordinal', order: ['C3', 'C1', 'C2']},
                x: {'type': 'category', 'scale': 'ordinal'},
                y: {'type': 'measure', 'scale': 'linear'}
            },
            type: 'stacked-bar',
            data: [
                {x: 'A', y: 1, c: 'C1'},
                {x: 'A', y: 2, c: 'C2'},
                {x: 'A', y: 3, c: 'C3'}
            ],
            x: 'x',
            y: 'y',
            color: 'c'
        });
        chart0.renderTo(div, size);

        var svg0 = chart0.getSVG();
        expect(svg0.querySelectorAll('.bar').length).to.equals(3);
        var tempOrder = [];
        d3.select(svg0).selectAll('.bar')[0].forEach(function (rect) {
            var d3Rect = d3.select(rect);
            var d = d3Rect.data()[0];
            var y = d3Rect.attr('y');
            tempOrder.push({c: d.c, y: y});
        });
        var actualOrder = tempOrder.sort((a, b) => b.y - a.y).map((x) => x.c);
        expect(actualOrder).to.deep.equal(['C3', 'C1', 'C2'], 'specified order');
    });

    it('should have valid size in facet', function () {

        var chart0 = new tauCharts.Chart({
            type: 'stacked-bar',
            data: [
                {f: 'Volleyball', x: '20-25', y: 1, s: 100},
                {f: 'Volleyball', x: '15-20', y: 1, s: 0},

                {f: 'Hockey',     x: '15-20', y: 1, s: 0},
                {f: 'Hockey',     x: '20-25', y: 1, s: 0},

                {f: 'Swimming',   x: '15-20', y: 1, s: 0},
                {f: 'Swimming',   x: '20-25', y: 1, s: 0}
            ],
            x: ['f', 'x'],
            y: 'y',
            size: 's'
        });
        chart0.renderTo(div, size);

        var svg0 = chart0.getSVG();
        expect(svg0.querySelectorAll('.bar').length).to.equals(6);
        var ws = [];
        d3.select(svg0).selectAll('.bar')[0].forEach(function (rect) {
            var d3Rect = d3.select(rect);
            var w = d3Rect.attr('width');
            ws.push(w);
        });
        expect(ws).to.deep.equal(['40', '3', '3', '3', '3', '3'], 'keeps right size across facet');
    });
});
