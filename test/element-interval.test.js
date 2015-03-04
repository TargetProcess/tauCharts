// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var _ = require('underscore');
    var assert = require('chai').assert;
    var tauCharts = require('src/tau.charts');
    var Cartesian = require('src/elements/coords.cartesian').Cartesian;
    var Interval = require('src/elements/element.interval').Interval;
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
    unitsRegistry.reg('COORDS.RECT', Cartesian)
        .reg('ELEMENT.INTERVAL', Interval);

    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;
    var _ = require('underscore');
    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: -2, color: 'yellow', size: 8},
        {x: 'c', y: 5, color: 'green', size: 8}
    ];

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
            trans: {
                where: function (data, tuple) {
                    var predicates = _.map(tuple, function (v, k) {
                        return function (row) {
                            return (row[k] === v);
                        }
                    });
                    return _(data).filter(function (row) {
                        return _.every(predicates, function (p) {
                            return p(row);
                        })
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
                'size:default': {type: 'size', source: '?', mid: 5},
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

        function d(name, spec, data, fn) {
            describe(name, function () {
                var context = {
                    element: null,
                    chart: null
                };

                beforeEach(function () {
                    context.element = document.createElement('div');
                    document.body.appendChild(context.element);

                    // tauCharts.Plot.globalSettings = testChartSettings;

                    context.chart = new tauCharts.GPL(convertSpec(spec, data));

                    context.chart.renderTo(context.element, {width: 800, height: 800});
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
                expect(convertToFixed(attrib(el, 'x'))).to.equal(convertToFixed(coords[index][ind].x));
                expect(convertToFixed(attrib(el, 'y'))).to.equal(convertToFixed(coords[index][ind].y));
                if (coords[index][ind].width) {
                    expect(convertToFixed(attrib(el, 'width'))).to.equal(convertToFixed(coords[index][ind].width));
                }
            });
        });

        // expect(bars[2].childNodes.length).to.equal(0);
    };
    describePlot(
        "ELEMENT.INTERVAL WITH LINEAR AND CATEGORICAL AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                units: [
                    {
                        type: 'ELEMENT.INTERVAL',
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
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: 5, color: 'green', size: 8},
            {x: 'c', y: -2, color: 'yellow', size: 8}
        ],
        function (context) {
            it("should render group bar element", function () {
                var chart = context.chart;
                assert.equal(schemes.barGPL.errors(chart.config), false, 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });
            it("should group contain interval element", function () {
                //    debugger
                expectCoordsElement(expect, [
                    // generate with help generateCoordIfChangeDesign
                    [
                        {
                            "x": "0",
                            "y": "429",
                            "width": "62.5000"
                        }
                    ],
                    [
                        {
                            "x": "250",
                            "y": "482",
                            "width": "62.5000"
                        },
                        {
                            "x": "500",
                            "y": "0",
                            "width": "62.5000"
                        }
                    ],
                    [
                        {
                            "x": "500",
                            "y": "536",
                            "width": "62.5000"
                        }
                    ]
                ]);
            });
        }
    );
    describePlot(
        "ELEMENT.INTERVAL WITH X LINEAR  AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'y',
                y: 'x',
                units: [
                    {
                        x: 'y',
                        y: 'x',
                        expression: {
                            inherit: true,
                            source: '/',
                            operator: 'none'
                        }
                    }
                ]
            }
        },
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "318.5",
                            "y": "625"
                        },
                        {
                            "x": "265.5",
                            "y": "375"
                        },
                        {
                            "x": "-2.5",
                            "y": "125"
                        },
                        {
                            "x": "747.5",
                            "y": "125"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL WITH TWO CATEGORICAL AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'catY',
                units: [
                    {
                        x: 'x',
                        y: 'catY',
                        expression: {
                            inherit: true,
                            source: '/',
                            operator: 'none'
                        }
                    }
                ]
            }
        },
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "625"
                        },
                        {
                            "x": "250",
                            "y": "375"
                        },
                        {
                            "x": "500",
                            "y": "125"
                        },
                        {
                            "x": "500",
                            "y": "375"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot("ELEMENT.INTERVAL.FLIP WITH LINEAR AND CATEGORICAL AXIS", {
            unit: {
                type: 'COORDS.RECT',
                x: 'y',
                y: 'x',
                units: [
                    {
                        x: 'y',
                        flip: true,
                        y: 'x',
                        color: 'color'
                    }
                ]
            }
        },
        testData,
        function (context) {

            it("should render group bar element", function () {
                var chart = context.chart;
                assert.equal(schemes.barGPL.errors(chart.config), false, 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "214",
                            "y": "500"
                        }
                    ],
                    [
                        {
                            "x": "214",
                            "y": "250"
                        },
                        {
                            "x": "214",
                            "y": "0"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "0"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH Y LINEAR AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                units: [
                    {
                        flip: true
                    }
                ]
            }
        },
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "426.5"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "479.5"
                        },
                        {
                            "x": "0",
                            "y": "-2.5"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "747.5"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH TWO CATEGORICAL AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'catY',
                units: [
                    {
                        flip: true
                    }
                ]
            }
        },
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "500"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "250"
                        },
                        {
                            "x": "0",
                            "y": "250"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "0"
                        }
                    ]
                ]);
            });
        }
    );
    var offsetHrs = new Date().getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    var iso = function (str) {
        return (str + '+' + offsetISO);
    };
    var dataWithDate = [
        {
            "createDate": new Date(iso("2014-09-02T00:00:00")),
            "count": 123
        },
        {
            "createDate": new Date(iso("2014-09-29T00:00:00")),
            "count": 34
        },
        {
            "createDate": new Date(iso("2014-10-13T00:00:00")),
            "count": 2
        }
    ];

    describePlot(
        "ELEMENT.INTERVAL WITH TWO ORDER AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'date',
                y: 'count',
                units: [
                    {
                        type: 'ELEMENT.INTERVAL'
                    }
                ]
            }
        },
        dataWithDate,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "0"
                        },
                        {
                            "x": "482.14285714285717",
                            "y": "552"
                        },
                        {
                            "x": "732.1428571428571",
                            "y": "749"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH TWO ORDER AXIS",
        {

            unit: {
                type: 'COORDS.RECT',
                x: 'count',
                y: 'date',
                units: [
                    {
                        flip: true
                    }
                ]
            }
        },
        dataWithDate,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "732.1428571428571"
                        },
                        {
                            "x": "0",
                            "y": "249.99999999999997"
                        },
                        {
                            "x": "0",
                            "y": "1.5987211554602254e-14"
                        }
                    ]
                ]);
            });
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
    ]
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
    /*
     describePlot(
     "ELEMENT.INTERVAL WITH MEASURE (:time) AXIS as X / MEASURE (:number) as Y",
     {
     dimensions: {
     "time": {
     "type": "measure",
     "scale": "time"
     },
     "count": {
     "type": "measure"
     }
     },
     unit: {
     type: 'COORDS.RECT',
     y: 'count',
     x: 'time',
     guide: {
     x: {autoScale: false},
     y: {autoScale: false}
     },
     unit: [
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
     /!*it("should group contain interval element", function () {

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

     _.each(bars, function (bar, barIndex) {
     _.each(bar.childNodes, function (el, elIndex) {
     expect(parseFloat(attrib(el, 'y'))).to.equal(ys[barIndex][elIndex]);
     expect(parseFloat(attrib(el, 'height'))).to.equal(coords[barIndex][elIndex]);
     });
     });
     });*!/
     });

     describePlot(
     "ELEMENT.INTERVAL.FLIP WITH MEASURE (:time) AXIS as Y / MEASURE (:number) as X",
     {
     dimensions: {
     "time": {
     "type": "measure",
     "scale": "time"
     },
     "count": {
     "type": "measure"
     }
     },
     unit: {
     type: 'COORDS.RECT',
     x: 'count',
     y: 'time',
     guide: {
     x: {autoScale: false},
     y: {autoScale: false}
     },
     unit: [
     {
     type: 'ELEMENT.INTERVAL',
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
     /!* it("should group contain interval element", function () {

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

     _.each(bars, function (bar, barIndex) {
     _.each(bar.childNodes, function (el, elIndex) {
     expect(parseFloat(attrib(el, 'x'))).to.equal(xs[barIndex][elIndex]);
     expect(parseFloat(attrib(el, 'width'))).to.equal(coords[barIndex][elIndex]);
     });
     });
     });*!/
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

     describeChart("interval offset should right if color dim not defined",
     {
     type: 'bar',
     x: 'y',
     y: 'x'
     },
     [{
     x: 2,
     y: "2"
     }, {
     x: 2,
     y: "4"
     }, {
     x: 3,
     y: "5"
     }],
     function (context) {
     it('test position', function () {
     var svg = context.chart.getSVG();
     var offsets = _.map(svg.querySelectorAll('.i-role-bar-group'), function (item) {
     return item.getAttribute('transform');
     });
     expect(offsets).to.eql(["translate(66.66666666666667,0)"]);
     });

     },
     {
     autoWidth: false
     }
     );*/
});