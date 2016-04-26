// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var _ = require('underscore');
    var assert = require('chai').assert;
    var tauCharts = require('src/tau.charts');
    var scalesRegistry = tauCharts.api.scalesRegistry.instance();
    var Cartesian = require('src/elements/coords.cartesian').Cartesian;
    var Interval = require('src/elements/element.interval').Interval;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;
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
        .reg('ELEMENT.INTERVAL', Interval);

    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;

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
                    var predicates = _.map(tuple, function (v, k) {
                        return function (row) {
                            return (row[k] === v);
                        };
                    });
                    return _(data).filter(function (row) {
                        return _.every(predicates, function (p) {
                            return p(row);
                        });
                    });
                }
            },
            scales: _.defaults(spec.scales || {}, {
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
                units: [_.defaults(unit.units[0], {
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

                    context.chart = new tauCharts.GPL(
                        sss,
                        new ScalesFactory(scalesRegistry, sss.sources, sss.scales),
                        unitsRegistry
                    );

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
    var expectCoordsElement = function (expect, coords) {

        var bars = getGroupBar();

        var convertToFixed = function (x) {
            return parseFloat(x).toFixed(4);
        };

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
                        guide: {prettify: false},
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
                assert.equal(schemes.barGPL.errors(chart.config), false, 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });

            it('should contain correct interval elements', function () {

                var barWidth = 7.5;

                expectCoordsElement(expect, [
                    [
                        {
                            "x": 8.75,
                            "y": 0,
                            "width": barWidth,
                            "height": 50
                        }
                    ],
                    [
                        {
                            "x": 56.25,
                            "y": 25,
                            "width": barWidth,
                            "height": 25
                        },
                        {
                            "x": 96.25,
                            "y": 50,
                            "width": barWidth,
                            "height": 0
                        },
                        {
                            "x": 96.25,
                            "y": 50,
                            "width": barWidth,
                            "height": 25
                        }
                    ],
                    [
                        {
                            "x": 103.75,
                            "y": 50,
                            "width": barWidth,
                            "height": 50
                        }
                    ]
                ]);
            });
        },
        {
            width: 120,
            height: 100
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
                            "x": 99.5,  // a100
                            "y": 100,
                            width: 1,
                            height: 20
                        },
                        {
                            "x": 74.5,  // b50
                            "y": 60,
                            width: 1,
                            height: 60
                        },
                        {
                            "x": 24.5,  // c-50
                            "y": 20,
                            width: 1,
                            height: 100
                        },
                        {
                            "x": -0.5,  // c-100
                            "y": 20,
                            width: 1,
                            height: 100
                        },
                        {
                            "x": 49.5000,// c0
                            "y": 20,
                            width: 1,
                            height: 100
                        }
                    ]
                ]);
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
                ]);
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
                assert.equal(schemes.barGPL.errors(chart.config), false, 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });

            it('should contain correct interval elements', function () {

                var barWidth = 7.5;

                expectCoordsElement(expect, [
                    [
                        {
                            "x": 50,    // 100
                            "y": 88.75,
                            height: barWidth,
                            width: 50
                        }
                    ],
                    [
                        {
                            "x": 50,    // 50
                            "y": 56.25,
                            height: barWidth,
                            width: 25
                        },
                        {
                            "x": 50,    // 0
                            "y": 16.25,
                            height: barWidth,
                            width: 0
                        }
                    ],
                    [
                        {
                            "x": 0,     // -100
                            "y": 23.75,
                            height: barWidth,
                            width: 50
                        }
                    ]
                ]);
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
                            "y": 56.5,
                            height: 1,
                            width: 20
                        },
                        {
                            "x": 0,
                            "y": 63.5,
                            height: 1,
                            width: 60
                        },
                        {
                            "x": 0,
                            "y": -0.5,
                            height: 1,
                            width: 100
                        },
                        {
                            "x": 0,
                            "y": 99.5,
                            height: 1,
                            width: 100
                        }
                    ]
                ]);
            });
        },
        {
            width: 120,
            height: 100
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
                ]);
            });
        },
        {
            width: 120,
            height: 120
        }
    );

    var offsetHrs = new Date().getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    var iso = function (str) {
        return (str + '+' + offsetISO);
    };

    describePlot(
        'ELEMENT.INTERVAL WITH TWO ORDER AXIS',
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'date',
                y: 'count',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false},
                    y: {hide: true, nice: false}
                },
                units: [
                    {
                        type: 'ELEMENT.INTERVAL',
                        guide: {prettify: false}
                    }
                ]
            }
        },
        [
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
        function () {
            it('should contain correct interval elements', function () {

                var stepSize = 100 / 4;
                var barWidth = stepSize / 2;
                var xi = (i) => String(stepSize * i + (stepSize - barWidth) / 2);

                expectCoordsElement(expect, [
                    [
                        {
                            "x": xi(0),
                            "y": 0,
                            "width": barWidth,
                            "height": 100
                        },
                        {
                            "x": xi(1),
                            "y": 50,
                            "width": barWidth,
                            "height": 50
                        },
                        {
                            "x": xi(2),
                            "y": 99,
                            "width": barWidth,
                            "height": 1
                        },
                        {
                            "x": xi(3),
                            "y": 100,
                            "width": barWidth,
                            "height": 0
                        }
                    ]
                ]);
            });
        },
        {
            width: 100,
            height: 100
        }
    );

    describePlot(
        'ELEMENT.INTERVAL.FLIP WITH TWO ORDER AXIS',
        {

            unit: {
                type: 'COORDS.RECT',
                x: 'count',
                y: 'date',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false, min: 0, max: 100},
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
        function () {
            it('should contain correct interval elements', function () {
                expectCoordsElement(
                    expect,
                    [
                        [
                            {
                                "x": 0,
                                "y": 87,
                                "width": 100,
                                "height": 1
                            },
                            {
                                "x": 0,
                                "y": 62,
                                "width": 50,
                                "height": 1
                            },
                            {
                                "x": 0,
                                "y": 37,
                                "width": 1,
                                "height": 1
                            },
                            {
                                "x": 0,
                                "y": 12,
                                "width": 0,
                                "height": 1
                            }
                        ]
                    ]);
            });
        },
        {
            width: 100,
            height: 100
        }
    );
    var testExpectCoordForTimeAdCount = [
        [
            750,
            375,
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

                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'height')))
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
                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'width')))
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
                        375,
                        187,
                        minimalHeight,
                        0,
                        minimalHeight,
                        188,
                        375
                    ]
                ];

                var ys = [
                    [
                        0,      // count = 1000
                        188,    // count = 500
                        374,    // count = 1 (minus minimal height)
                        375,    // count = 0
                        375,    // count = -1
                        375,    // count = -500
                        375     // count = -1000
                    ]
                ];

                var bars = getGroupBar();
                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'y'))).to.equal(ys[barIndex][elIndex]);
                        expect(parseFloat(attrib(el, 'height'))).to.equal(coords[barIndex][elIndex]);
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
                        375,
                        188,
                        minimalHeight,
                        0,
                        minimalHeight,
                        187,
                        375
                    ]
                ];

                var xs = [
                    [
                        375,    // count = 1000
                        375,    // count = 500
                        375,    // count = 1
                        375,    // count = 0
                        374,    // count = -1 (minus minimal height)
                        188,    // count = -500
                        0       // count = -1000
                    ]
                ];

                var bars = getGroupBar();
                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'x'))).to.equal(xs[barIndex][elIndex]);
                        expect(parseFloat(attrib(el, 'width'))).to.equal(coords[barIndex][elIndex]);
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
                var width = _.map(svg.querySelectorAll('.i-role-element'), function (item) {
                    return item.getAttribute('width');
                });
                expect(_.unique(width).length).to.equals(1);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart('interval offset without color dim',
        {
            type: 'bar',
            x: 'y',
            y: 'x'
        },
        [
            {x: 2, y: "2"},
            {x: 2, y: "4"},
            {x: 3, y: "5"}
        ],
        function (context) {

            it('should produce 1 frame element', function () {
                var svg = context.chart.getSVG();
                var offsets = _.map(svg.querySelectorAll('.i-role-bar-group'), function (item) {
                    return item.getAttribute('transform');
                });
                expect(offsets.length).to.equal(1);
                expect(offsets).to.deep.equal([null]);
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
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var intervalNode = context.chart.select((n) => n.config.type === 'ELEMENT.INTERVAL')[0];
                intervalNode.fire('highlight', ((row) => (row.color === 'green')));

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.bar').length).to.equals(4);
                expect(svg1.querySelectorAll('.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.graphical-report__dimmed').length).to.equals(3);

                intervalNode.fire('highlight', ((row) => null));

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.bar').length).to.equals(4);
                expect(svg2.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);
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
                expect(d3.select(bars[0]).attr('x')).to.equals('32');
                expect(d3.select(bars[1]).attr('x')).to.equals('264');
                expect(d3.select(bars[2]).attr('x')).to.equals('496');
                expect(d3.select(bars[3]).attr('x')).to.equals('728');

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
});