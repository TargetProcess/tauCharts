// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var assert = require('chai').assert;
    var tauCharts = require('src/tau.charts');
    var Cartesian = require('src/elements/coords.cartesian').Cartesian;
    var Interval = require('src/elements/element.interval').Interval;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;
    var utils = require('src/utils/utils').utils;
    var testUtils = require('testUtils');

    var iref = 0;
    var scalesRegistry = tauCharts.api.scalesRegistry.instance({
        references: new WeakMap(),
        refCounter: (() => (++iref))
    });

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
        },
        create: function (unitType, unitConfig) {

            if (!unitsMap.hasOwnProperty(unitType)) {
                throw new Error('Unknown unit type: ' + unitType);
            }

            return new unitsMap[unitType](unitConfig);
        }
    };
    unitsRegistry
        .reg('COORDS.RECT', Cartesian)
        .reg('ELEMENT.INTERVAL', Interval);

    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;
    var roundAttr = function (el, attr) {
        return Math.round(el.getAttribute(attr));
    };

    function generateCoordIfChangeDesign() {
        var map = [].map;
        var bars = getGroupBar();
        var coords = bars.map(function (bar) {
            var childCoords = map.call(bar.childNodes, function (el) {
                return {x: attrib(el, 'x'), y: attrib(el, 'y')};
            });
            return childCoords;
        });
        return coords;
    }

    window.generateCoordIfChangeDesign = generateCoordIfChangeDesign;
    var convertSpec = function (spec, data) {
        var unit = spec.unit;
        return {
            sources: {
                '?': {
                    dims: {},
                    data: []
                },
                '/': {
                    dims: {
                        x: {type: 'category'},
                        y: {type: 'measure'},
                        createDate: {type: 'date'},
                        time: {type: 'measure'},
                        color: {type: 'category'},
                        count: {type: 'measure'}
                    },
                    data: data.map(function (item) {
                        /*if (item.createDate) {
                         item.createDate = item.createDate.getTime()
                         }*/
                        return item;

                    })
                }
            },
            unitsRegistry: unitsRegistry,
            transformations: {
                where: function (data, tuple) {
                    var predicates = tuple.map(function (v, k) {
                        return function (row) {
                            return (row[k] === v);
                        };
                    });
                    return data.filter(function (row) {
                        return predicates.every(function (p) {
                            return p(row);
                        });
                    });
                }
            },
            scales: utils.defaults(spec.scales || {}, {
                'x': {type: 'ordinal', source: '/', dim: 'x'},
                'y': {type: 'linear', source: '/', dim: 'y'},
                'date': {type: 'period', period: 'day', source: '/', dim: 'createDate'},
                'count': {type: 'linear', source: '/', dim: 'count'},
                'time': {type: 'time', source: '/', dim: 'time'},
                'catY': {type: 'ordinal', source: '/', dim: 'color'},
                'size:default': {type: 'size', source: '?', minSize: 0, maxSize: 1},
                'color': {type: 'color', dim: 'color', source: '/'},
                'color:default': {type: 'color', source: '?', brewer: null}
            }),
            unit: {
                type: 'COORDS.RECT',
                expression: {
                    inherit: false,
                    source: '/',
                    operator: 'none'
                },
                x: unit.x,
                y: unit.y,
                guide: unit.guide || {},
                units: [utils.defaults(unit.units[0], {
                    type: 'ELEMENT.INTERVAL',
                    x: unit.x || 'x',
                    y: unit.y || 'y',
                    expression: {
                        inherit: true,
                        source: '/',
                        operator: 'groupBy',
                        params: ['color']
                    }
                })]
            }
        }
    };
    var describePlot = /*testUtils.describePlot;*/

        function d(name, spec, data, fn, size) {
            describe(name, function () {
                var context = {
                    element: null,
                    chart: null
                };

                size = size || {};

                beforeEach(function () {
                    context.element = document.createElement('div');
                    document.body.appendChild(context.element);

                    // tauCharts.Plot.globalSettings = testChartSettings;

                    var sss = convertSpec(spec, data);
                    if (size.print) {
                        console.log(JSON.stringify(sss, null, 2));
                    }

                    sss.settings = sss.settings || {};
                    sss.settings.specEngine = 'NONE';
                    sss.settings.layoutEngine = 'NONE';
                    context.chart = new tauCharts.Plot(sss);
                    context.chart.renderTo(
                        context.element,
                        {
                            width: size.width || 800,
                            height: size.height || 800
                        });
                });

                fn(context);

                afterEach(function () {
                    context.element.parentNode.removeChild(context.element);
                });
            });
        }; // testUtils.describePlot;

    var describeChart = testUtils.describeChart;
    var expectCoordsElement = function (expect, coords, ...sortFields) {

        var bars = getGroupBar();

        var convertToFixed = function (x) {
            return parseFloat(x).toFixed(0);
        };

        coords = [coords.reduce((m, c) => m.concat(c), [])];
        coords.forEach((c) => c.sort((a, b) => {
            var result = 0;
            sortFields.every((f) => {
                var prop = f.replace('-', '');
                result = ((a[prop] - b[prop]) * [1, -1][Number(f[0] === '-')]);
                return (result === 0);
            })
            return result;
        }));

        bars.forEach(function (bar, index) {
            Array.from(bar.childNodes).forEach(function (el, ind) {
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
            });
        });
    };

    describePlot(
        'ELEMENT.INTERVAL WITH LINEAR AND CATEGORICAL AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        type: 'ELEMENT.INTERVAL',
                        guide: {
                            prettify: false
                        },
                        x: 'x',
                        flip: false,
                        y: 'y',
                        color: 'color',
                        expression: {
                            inherit: true,
                            source: '/',
                            operator: 'groupBy',
                            params: ['color']
                        }
                    }
                ]
            }
        },
        [
            {x: 'a', y: 100, color: 'red'},

            {x: 'b', y: 50, color: 'green'},
            {x: 'c', y: 0, color: 'green'},
            {x: 'c', y: -50, color: 'green'},

            {x: 'c', y: -100, color: 'yellow'}
        ],
        function (context) {

            it('should render group bar element', function () {
                var chart = context.chart;
                assert.equal(schemes.barGPL.errors(chart.getSpec()), false, 'spec is right');
                expect(getGroupBar().length).to.equal(1);
            });

            it('should contain correct interval elements', function () {

                var barWidth = 56;

                expectCoordsElement(expect, [
                    [
                        {
                            "x": 122,
                            "y": 0,
                            "width": barWidth,
                            "height": 400
                        }
                    ],
                    [
                        {
                            "x": 422,
                            "y": 200,
                            "width": barWidth,
                            "height": 200
                        },
                        {
                            "x": 694,
                            "y": 400,
                            "width": barWidth,
                            "height": 0
                        },
                        {
                            "x": 694,
                            "y": 400,
                            "width": barWidth,
                            "height": 200
                        }
                    ],
                    [
                        {
                            "x": 750,
                            "y": 400,
                            "width": barWidth,
                            "height": 400
                        }
                    ]
                ], '-height', 'x');
            });
        },
        {
            width: 900,
            //height: 100
        }
    );

    describePlot(
        'ELEMENT.INTERVAL WITH X LINEAR AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'y',
                y: 'x',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        x: 'y',
                        y: 'x',
                        guide: {
                            prettify: false,
                            size: {enableDistributeEvenly: false}
                        },
                        expression: {
                            inherit: true,
                            source: '/',
                            operator: 'none'
                        }
                    }
                ]
            }
        },
        [
            {x: 'a', y: 100},
            {x: 'b', y: 50},
            {x: 'c', y: -50},
            {x: 'c', y: -100},
            {x: 'c', y: 0}
        ],
        function () {
            it('should contain correct interval elements', function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": 100,  // a100
                            "y": 100,
                            width: 1,
                            height: 20
                        },
                        {
                            "x": 75,  // b50
                            "y": 60,
                            width: 1,
                            height: 60
                        },
                        {
                            "x": 25,  // c-50
                            "y": 20,
                            width: 1,
                            height: 100
                        },
                        {
                            "x": -1,  // c-100
                            "y": 20,
                            width: 1,
                            height: 100
                        },
                        {
                            "x": 50,  // c0
                            "y": 20,
                            width: 1,
                            height: 100
                        }
                    ]
                ], '-height', 'x');
            });
        },
        {
            width: 100,
            height: 120
        }
    );

    describePlot(
        'ELEMENT.INTERVAL WITH TWO CATEGORICAL AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'catY',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        x: 'x',
                        y: 'catY',
                        guide: {prettify: false},
                        expression: {
                            inherit: true,
                            source: '/',
                            operator: 'none'
                        }
                    }
                ]
            }
        },
        [
            {x: 'a', color: 'red'},
            {x: 'b', color: 'green'},
            {x: 'c', color: 'yellow'},
            {x: 'c', color: 'green'}
        ],
        function () {
            it('should contain correct interval elements', function () {

                var colorsCount = 3;
                var stepSize = 120 / colorsCount;
                var barWidth = stepSize / 2;
                var xi = (i) => (stepSize * i + (stepSize - barWidth) / 2);

                expectCoordsElement(expect, [
                    [
                        {
                            "x": xi(0),
                            "y": 100,
                            width: barWidth,
                            height: 20
                        },
                        {
                            "x": xi(1),
                            "y": 60,
                            width: barWidth,
                            height: 60
                        },
                        {
                            "x": xi(2),
                            "y": 20,
                            width: barWidth,
                            height: 100
                        },
                        {
                            "x": xi(2),
                            "y": 60,
                            width: barWidth,
                            height: 60
                        }
                    ]
                ], '-height', 'x');
            });
        },
        {
            width: 120,
            height: 120
        }
    );

    describePlot('ELEMENT.INTERVAL.FLIP WITH LINEAR AND CATEGORICAL AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'y',
                y: 'x',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        x: 'y',
                        flip: true,
                        y: 'x',
                        color: 'color',
                        guide: {prettify: false}
                    }
                ]
            }
        },
        [
            {x: 'a', y: 100, color: 'red', size: 6},
            {x: 'b', y: 50, color: 'green', size: 6},
            {x: 'c', y: -100, color: 'yellow', size: 8},
            {x: 'c', y: 0, color: 'green', size: 8}
        ],
        function (context) {

            it('should render group bar element', function () {
                var chart = context.chart;
                assert.equal(schemes.barGPL.errors(chart.getSpec()), false, 'spec is right');
                expect(getGroupBar().length).to.equal(1);
            });

            it('should contain correct interval elements', function () {

                var barWidth = 7.5;

                expectCoordsElement(expect, [
                    [
                        {
                            "x": 50,    // 100
                            "y": 96,
                            height: barWidth,
                            width: 50
                        }
                    ],
                    [
                        {
                            "x": 50,    // 50
                            "y": 56,
                            height: barWidth,
                            width: 25
                        },
                        {
                            "x": 50,    // 0
                            "y": 13,
                            height: barWidth,
                            width: 0
                        }
                    ],
                    [
                        {
                            "x": 0,     // -100
                            "y": 20,
                            height: barWidth,
                            width: 50
                        }
                    ]
                ], '-width', 'y');
            });
        },
        {
            width: 100,
            height: 120
        }
    );

    describePlot(
        'ELEMENT.INTERVAL.FLIP WITH Y LINEAR AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        flip: true,
                        guide: {
                            prettify: false,
                            size: {enableDistributeEvenly: false}
                        }
                    }
                ]
            }
        },
        [
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: -2, color: 'yellow', size: 8},
            {x: 'c', y: 5, color: 'green', size: 8}
        ],
        function () {
            it('should contain correct interval elements', function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": 0,
                            "y": 171,
                            height: 1,
                            width: 20
                        },
                        {
                            "x": 0,
                            "y": 192,
                            height: 1,
                            width: 60
                        },
                        {
                            "x": 0,
                            "y": -1,
                            height: 1,
                            width: 100
                        },
                        {
                            "x": 0,
                            "y": 300,
                            height: 1,
                            width: 100
                        }
                    ]
                ], '-width', 'y');
            });
        },
        {
            width: 120,
            height: 300
        }
    );

    describePlot(
        'ELEMENT.INTERVAL.FLIP WITH TWO CATEGORICAL AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'catY',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        flip: true,
                        guide: {prettify: false}
                    }
                ]
            }
        },
        [
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: -2, color: 'yellow', size: 8},
            {x: 'c', y: 5, color: 'green', size: 8}
        ],
        function () {
            it('should contain correct interval elements', function () {

                var colorsCount = 3;
                var stepSize = 120 / colorsCount;
                var barWidth = stepSize / 2;
                var xi = (i) => (stepSize * i + (stepSize - barWidth) / 2);

                expectCoordsElement(expect, [
                    [
                        {
                            "x": 0,
                            "y": xi(2),
                            height: barWidth,
                            width: 20
                        },
                        {
                            "x": 0,
                            "y": xi(1), // green
                            height: barWidth,
                            width: 60
                        },
                        {
                            "x": 0,
                            "y": xi(1), // green
                            height: barWidth,
                            width: 100
                        },
                        {
                            "x": 0,
                            "y": xi(0),
                            height: barWidth,
                            width: 100
                        }
                    ]
                ], '-width', 'y');
            });
        },
        {
            width: 120,
            height: 120
        }
    );

    var iso = function (str) {
        var offsetHrs = new Date(str).getTimezoneOffset() / 60;
        var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
        return (str + '+' + offsetISO);
    };

    var testExpectCoordForTimeAdCount = [
        [
            800,
            400,
            1
        ]
    ];

    var testDataCoordForTimeAdCount = [
        {time: testUtils.toLocalDate('2014-02-03'), count: 0},
        {time: testUtils.toLocalDate('2014-02-02'), count: 5},
        {time: testUtils.toLocalDate('2014-02-01'), count: 10}
    ];

    describePlot(
        "ELEMENT.INTERVAL WITH MEASURE (:time) as X / MEASURE (:number) AXIS as Y",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'count',
                y: 'time',
                units: [
                    {
                        flip: false
                    }
                ]
            }
        },
        testDataCoordForTimeAdCount,
        function () {
            it("should group contain interval element", function () {
                var bars = getGroupBar();

                bars.forEach(function (bar, barIndex) {
                    Array.from(bar.childNodes).forEach(function (el, elIndex) {
                        expect(roundAttr(el, 'height'))
                            .to.equal(testExpectCoordForTimeAdCount[barIndex][elIndex]);
                    });
                });
            });
        });

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH MEASURE (:number) AXIS as X / MEASURE (:time) as Y",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'time',
                y: 'count',
                units: [
                    {
                        flip: true
                    }
                ]
            }
        },
        testDataCoordForTimeAdCount,
        function () {
            it("should group contain interval element", function () {
                var bars = getGroupBar();
                bars.forEach(function (bar, barIndex) {
                    Array.from(bar.childNodes).forEach(function (el, elIndex) {
                        expect(roundAttr(el, 'width'))
                            .to.equal(testExpectCoordForTimeAdCount[barIndex][elIndex]);
                    });
                });
            });
        });

    describePlot(
        "ELEMENT.INTERVAL WITH MEASURE (:time) AXIS as X / MEASURE (:number) as Y",
        {
            unit: {
                y: 'count',
                x: 'time',
                units: [
                    {
                        guide: {
                            sortByBarHeight: false
                        },
                        type: 'ELEMENT.INTERVAL'
                    }
                ]
            }
        },
        [
            {time: testUtils.toLocalDate('2014-02-01'), count: 1000},
            {time: testUtils.toLocalDate('2014-02-02'), count: 500},
            {time: testUtils.toLocalDate('2014-02-03'), count: 1},
            {time: testUtils.toLocalDate('2014-02-04'), count: 0},
            {time: testUtils.toLocalDate('2014-02-05'), count: -1},
            {time: testUtils.toLocalDate('2014-02-06'), count: -500},
            {time: testUtils.toLocalDate('2014-02-07'), count: -1000}
        ],
        function () {
            it("should group contain interval element", function () {

                var minimalHeight = 1;

                var coords = [
                    [
                        400,
                        200,
                        minimalHeight,
                        0,
                        minimalHeight,
                        200,
                        400
                    ]
                ];

                var ys = [
                    [
                        0,      // count = 1000
                        200,    // count = 500
                        399,    // count = 1 (minus minimal height)
                        400,    // count = 0
                        400,    // count = -1
                        400,    // count = -500
                        400     // count = -1000
                    ]
                ];

                var bars = getGroupBar();
                bars.forEach(function (bar, barIndex) {
                    Array.from(bar.childNodes).forEach(function (el, elIndex) {
                        expect(roundAttr(el, 'y')).to.equal(ys[barIndex][elIndex]);
                        expect(roundAttr(el, 'height')).to.equal(coords[barIndex][elIndex]);
                    });
                });
            });
        });

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH MEASURE (:time) AXIS as Y / MEASURE (:number) as X",
        {
            unit: {
                x: 'count',
                y: 'time',
                units: [
                    {
                        guide: {
                            sortByBarHeight: false
                        },
                        flip: true
                    }
                ]
            }
        },
        [
            {time: testUtils.toLocalDate('2014-02-01'), count: 1000},
            {time: testUtils.toLocalDate('2014-02-02'), count: 500},
            {time: testUtils.toLocalDate('2014-02-03'), count: 1},
            {time: testUtils.toLocalDate('2014-02-04'), count: 0},
            {time: testUtils.toLocalDate('2014-02-05'), count: -1},
            {time: testUtils.toLocalDate('2014-02-06'), count: -500},
            {time: testUtils.toLocalDate('2014-02-07'), count: -1000}
        ],
        function () {
            it("should group contain interval element", function () {

                var minimalHeight = 1;

                var coords = [
                    [
                        400,
                        200,
                        minimalHeight,
                        0,
                        minimalHeight,
                        200,
                        400
                    ]
                ];

                var xs = [
                    [
                        400,    // count = 1000
                        400,    // count = 500
                        400,    // count = 1
                        400,    // count = 0
                        399,    // count = -1 (minus minimal height)
                        200,    // count = -500
                        0       // count = -1000
                    ]
                ];

                var bars = getGroupBar();
                bars.forEach(function (bar, barIndex) {
                    Array.from(bar.childNodes).forEach(function (el, elIndex) {
                        expect(roundAttr(el, 'x')).to.equal(xs[barIndex][elIndex]);
                        expect(roundAttr(el, 'width')).to.equal(coords[barIndex][elIndex]);
                    });
                });
            });
        });

    describeChart("interval width for facet",
        {
            type: 'bar',
            x: ['type', 'y'],
            y: 'x',
            color: 'color'
        },
        [{
            x: 2,
            y: "2",
            type: true,
            color: 'yellow'

        }, {
            x: 2,
            y: "4",
            type: false,
            color: 'yellow'

        }, {
            x: 3,
            y: "4",
            type: false,
            color: 'green'

        }],
        function (context) {
            it("all bar for facet chart should have equal width", function () {
                var svg = context.chart.getSVG();
                var width = Array.from(svg.querySelectorAll('.i-role-element')).map(function (item) {
                    return item.getAttribute('width');
                });
                expect(utils.unique(width).length).to.equals(1);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart("ELEMENT.INTERVAL event API",
        {
            type: 'bar',
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
                expect(svg0.querySelectorAll('.bar').length).to.equals(4);
                expect(svg0.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var intervalNode = context.chart.select((n) => n.config.type === 'ELEMENT.INTERVAL')[0];
                intervalNode.fire('highlight', ((row) => (row.color === 'green')));

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.bar').length).to.equals(4);
                expect(svg1.querySelectorAll('.bar.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.bar.graphical-report__dimmed').length).to.equals(3);

                expect(svg1.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(3);

                intervalNode.fire('highlight', ((row) => null));

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.bar').length).to.equals(4);
                expect(svg2.querySelectorAll('.bar.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.bar.graphical-report__dimmed').length).to.equals(0);

                expect(svg1.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(0);
                expect(svg1.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(0);
            });

            it("should react on mouseover / mouseout events", function () {
                var svg0 = context.chart.getSVG();
                expect(svg0.querySelectorAll('.bar').length).to.equals(4);
                expect(svg0.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var intervalNode = context.chart.select((n) => n.config.type === 'ELEMENT.INTERVAL')[0];
                intervalNode.fire('data-hover', {data:context.chart.getData()[0]});

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.bar').length).to.equals(4);
                expect(svg1.querySelectorAll('.bar.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.bar.graphical-report__dimmed').length).to.equals(0);

                intervalNode.fire('data-hover', {});

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.bar').length).to.equals(4);
                expect(svg2.querySelectorAll('.bar.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.bar.graphical-report__dimmed').length).to.equals(0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart('Bar highlight',
        {
            type: 'bar',
            x: 'date',
            y: 'effort',
            guide: {
                x: {hide: true},
                y: {hide: true}
            }
        },
        [
            {date: '2017-01-30', effort: 40},
            {date: '2017-01-30', effort: 20},
            {date: '2017-01-30', effort: -20},
            {date: '2017-01-30', effort: -40},
        ],
        function (context) {

            it('should highlight bar under cursor', function () {
                var svg = context.chart.getSVG();
                var bars = svg.querySelectorAll('.bar');
                var rects = Array.prototype.map.call(bars, (b) => b.getBoundingClientRect());
                var cx = ((Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right))) / 2);
                var top = Math.min(...rects.map(r => r.top));
                var bottom = Math.max(...rects.map(r => r.bottom));
                var interpolate = (a, b, t) => ((1 - t) * a + t * b);
                var testCursorAt = (part, value) => {
                    var y = ((1 - part) * top + part * bottom);
                    testUtils.simulateEvent('mousemove', svg, cx, y);
                    var highlighted = d3.select('.graphical-report__highlighted');
                    expect(highlighted.data()[0].effort).to.equal(value);
                    expect(testUtils.elementFromPoint(cx, y)).to.equal(highlighted.node());
                };

                testCursorAt(1 / 8, 40);
                testCursorAt(3 / 8, 20);
                testCursorAt(5 / 8, -20);
                testCursorAt(7 / 8, -40);
            });
        }
    );

    describeChart('Bar chart',
        {
            type : 'bar',
            x    : 'dim_x',
            y    : 'dim_y',
            color: 'dim_x',
            guide: {
                sortByBarHeight: false,
                padding: {l: 0, r: 0, b: 0, t: 0},
                prettify: false
            },
            settings: {specEngine: 'none'}
        },
        [
            {dim_x: 'A', dim_y: 1},
            {dim_x: 'B', dim_y: 2},
            {dim_x: 'C', dim_y: 3},
            {dim_x: 'D', dim_y: 4}
        ],
        function (context) {

            it('should disable positioning by color once color and X use the same dim', function () {
                var svg0 = context.chart.getSVG();
                var bars = svg0.querySelectorAll('.bar');
                expect(bars.length).to.equals(4);

                var stepSize = 200;
                var barWidth = 100;
                var xi = (i) => String(stepSize * i + (stepSize - barWidth) / 2);

                expect(d3.select(bars[0]).attr('x')).to.equals(xi(0));
                expect(d3.select(bars[1]).attr('x')).to.equals(xi(1));
                expect(d3.select(bars[2]).attr('x')).to.equals(xi(2));
                expect(d3.select(bars[3]).attr('x')).to.equals(xi(3));

                var barWidthStr = String(barWidth);
                expect(d3.select(bars[0]).attr('width')).to.equals(barWidthStr);
                expect(d3.select(bars[1]).attr('width')).to.equals(barWidthStr);
                expect(d3.select(bars[2]).attr('width')).to.equals(barWidthStr);
                expect(d3.select(bars[3]).attr('width')).to.equals(barWidthStr);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart('Bar chart',
        {
            type : 'bar',
            x    : 'dim_x',
            y    : 'dim_y',
            color: 'dim_x',
            guide: {
                sortByBarHeight: false,
                padding: {l: 0, r: 0, b: 0, t: 0},
                enableColorToBarPosition: true
            },
            settings: {specEngine: 'none'}
        },
        [
            {dim_x: 'A', dim_y: 1},
            {dim_x: 'B', dim_y: 2},
            {dim_x: 'C', dim_y: 3},
            {dim_x: 'D', dim_y: 4}
        ],
        function (context) {

            it('should force positioning by color once [enableColorToBarPosition] is true', function () {
                var svg0 = context.chart.getSVG();
                var bars = svg0.querySelectorAll('.bar');
                expect(bars.length).to.equals(4);
                expect(d3.select(bars[0]).attr('x')).to.equals('80');
                expect(d3.select(bars[1]).attr('x')).to.equals('280');
                expect(d3.select(bars[2]).attr('x')).to.equals('480');
                expect(d3.select(bars[3]).attr('x')).to.equals('680');

                var barWidth = '40';
                expect(d3.select(bars[0]).attr('width')).to.equals(barWidth);
                expect(d3.select(bars[1]).attr('width')).to.equals(barWidth);
                expect(d3.select(bars[2]).attr('width')).to.equals(barWidth);
                expect(d3.select(bars[3]).attr('width')).to.equals(barWidth);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart('Bar chart',
        {
            type : 'horizontal-bar',
            x    : 'dim_x',
            y    : 'dim_y',
            guide: {
                padding: {l: 0, r: 0, b: 0, t: 0},
                size: {maxSize: 22, enableDistributeEvenly: false}
            },
            settings: {specEngine: 'none'}
        },
        [
            {dim_x: 'A', dim_y: 1},
            {dim_x: 'B', dim_y: 2},
            {dim_x: 'C', dim_y: 3},
            {dim_x: 'D', dim_y: 4}
        ],
        function (context) {

            it('should allow to customize bar width for measure base scale', function () {
                var svg0 = context.chart.getSVG();
                var bars = svg0.querySelectorAll('.bar');
                expect(bars.length).to.equals(4);
                var expectedWidth = '22';
                expect(d3.select(bars[0]).attr('height')).to.equals(expectedWidth);
                expect(d3.select(bars[1]).attr('height')).to.equals(expectedWidth);
                expect(d3.select(bars[2]).attr('height')).to.equals(expectedWidth);
                expect(d3.select(bars[3]).attr('height')).to.equals(expectedWidth);
            });
        },
        {
            autoWidth: false
        }
    );

    describe('ELEMENT.INTERVAL', function () {

        var div;
        var size = {width: 1000, height: 1000};

        beforeEach(function () {
            div = document.createElement('div');
            document.body.appendChild(div);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should draw horizontal bar on 2 order axis', function () {

            var plot = new tauCharts.Chart({
                data: [
                    {
                        "createDate": new Date(iso("2014-09-01T00:00:00")),
                        "count": 100
                    },
                    {
                        "createDate": new Date(iso("2014-09-02T00:00:00")),
                        "count": 50
                    },
                    {
                        "createDate": new Date(iso("2014-09-03T00:00:00")),
                        "count": 1
                    },
                    {
                        "createDate": new Date(iso("2014-09-04T00:00:00")),
                        "count": 0
                    }
                ],
                type: 'horizontal-bar',
                x: 'count',
                y: 'createDate',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false, min: 0, max: 100},
                    y: {hide: true, nice: false, tickPeriod: 'day'},
                    prettify: false,
                    size: {enableDistributeEvenly: false}
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div,
                {
                    width: 120,
                    height: 100
                });

            expectCoordsElement(
                expect,
                [
                    [
                        {
                            "x": 0,
                            "y": 87,
                            width: 120,
                            height: 1
                        },
                        {
                            "x": 0,
                            "y": 62,
                            width: 60,
                            height: 1
                        },
                        {
                            "x": 0,
                            "y": 37,
                            width: 1,
                            height: 1
                        },
                        {
                            "x": 0,
                            "y": 12,
                            "width": 0,
                            "height": 1
                        }
                    ]
                ], '-width', 'y');
        });

        it('should draw vertical bar on 2 order axis', function () {

            var plot = new tauCharts.Chart({
                data: [
                    {
                        "createDate": new Date(iso("2014-09-01T00:00:00")),
                        "count": 100
                    },
                    {
                        "createDate": new Date(iso("2014-09-02T00:00:00")),
                        "count": 50
                    },
                    {
                        "createDate": new Date(iso("2014-09-03T00:00:00")),
                        "count": 1
                    },
                    {
                        "createDate": new Date(iso("2014-09-04T00:00:00")),
                        "count": 0
                    }
                ],
                type: 'bar',
                y: 'count',
                x: 'createDate',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false, tickPeriod: 'day'},
                    y: {hide: true, nice: false},
                    prettify: false
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });
            plot.renderTo(div,
                {
                    width: 100,
                    height: 120
                });

            var stepSize = 100 / 4;
            var barWidth = stepSize / 2;
            var xi = (i) => String(stepSize * i + (stepSize - barWidth) / 2);

            expectCoordsElement(
                expect,
                [
                    [
                        {
                            "x": xi(0),
                            "y": 0,
                            "width": barWidth,
                            "height": 120
                        },
                        {
                            "x": xi(1),
                            "y": 60,
                            "width": barWidth,
                            "height": 60
                        },
                        {
                            "x": xi(2),
                            "y": 119,
                            "width": barWidth,
                            "height": 1
                        },
                        {
                            "x": xi(3),
                            "y": 120,
                            "width": barWidth,
                            "height": 0
                        }
                    ]
                ], '-height', 'x');
        });
    });
    
    describeChart('Bars sorted by height',
        {
            type: 'bar',
            x: 'x',
            y: 'y',
            id: 'id',
            color: 'c',
            settings: {specEngine: 'none'}
        },
        [
            {id: 1, x: 1, y: 1, c: 'a'},
            {id: 2, x: 1, y: 2, c: 'b'},
            {id: 3, x: 1, y: 2, c: 'c'},

            {id: 4, x: 2, y: 2, c: 'c'},
            {id: 5, x: 2, y: 2, c: 'b'},
            {id: 6, x: 2, y: 2, c: 'a'}
        ],
        function (context) {

            it('should sort bars by height (desc), then by X, then by data order', function () {
                var svg = context.chart.getSVG();
                var bars = d3.select(svg).selectAll('.bar');
                var ids = bars.data().map((d) => d.id).join('');
                expect(ids).to.equal('236541');
            });
        },
        {
            autoWidth: false
        }
    );
    
    describeChart('Horizontal bars sorted by width',
        {
            type: 'horizontal-bar',
            x: 'x',
            y: 'y',
            id: 'id',
            color: 'c',
            settings: {specEngine: 'none'}
        },
        [
            {id: 1, x: 1, y: 1, c: 'a'},
            {id: 2, x: 2, y: 1, c: 'b'},
            {id: 3, x: 1, y: 1, c: 'c'},

            {id: 4, x: 2, y: 2, c: 'c'},
            {id: 5, x: 2, y: 2, c: 'b'},
            {id: 6, x: 3, y: 2, c: 'a'}
        ],
        function (context) {

            it('should horizontal sort bars by width (desc), then by Y, then by data order', function () {
                var svg = context.chart.getSVG();
                var bars = d3.select(svg).selectAll('.bar');
                var ids = bars.data().map((d) => d.id).join('');
                expect(ids).to.equal('654213');
            });
        },
        {
            autoWidth: false
        }
    );
});