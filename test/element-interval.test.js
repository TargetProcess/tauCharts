define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var assert = require('chai').assert;
    var tauChart = require('tau_modules/tau.newCharts').tauChart;
    var testUtils = require('testUtils');
    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;
    var _ = require('underscore');
    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: -2, color: 'yellow', size: 8},
        {x: 'c', y: 5, color: 'green', size: 8}
    ];
    /*function generateCoordIfChangeDesign(){
     var map = [].map;
     var bars = getGroupBar();
     var coords = bars.map(function (bar) {
     var childCoords = map.call(bar.childNodes,function (el) {
     return {x: attrib(el, 'x'), y: attrib(el, 'y')};
     });
     return childCoords;
     });
     return coords[0];
     }*/

    var describePlot = testUtils.describePlot;
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
                guide: {
                    x: {autoScale: false},
                    y: {autoScale: false}
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
        [
            {x: 'a', y: 1, color: 'red', size: 6},
            {x: 'b', y: 0.5, color: 'green', size: 6},
            {x: 'c', y: 5, color: 'green', size: 8},
            {x: 'c', y: -2, color: 'yellow', size: 8}
        ],
        function (context) {
            it("should render group bar element", function () {
                var chart = context.chart;
                assert.ok(schemes.bar(chart.config.spec), 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign
                    [
                        {
                            "x": "0",
                            "y": "457"
                        }
                    ],
                    [
                        {
                            "x": "266.66666666666663",
                            "y": "514"
                        },
                        {
                            "x": "533.3333333333334",
                            "y": "0"
                        }
                    ],
                    [
                        {
                            "x": "533.3333333333334",
                            "y": "571"
                        }
                    ]
                ]);
            });
        }
    );
    describePlot(
        "ELEMENT.INTERVAL WITH TWO LINEAR AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'y',
                y: 'x',
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
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign

                    [
                        {
                            "x": "340.5",
                            "y": "666.6666666666666"
                        },
                        {
                            "x": "283.5",
                            "y": "399.99999999999994"
                        },
                        {
                            "x": "-2.5",
                            "y": "133.33333333333326"
                        },
                        {
                            "x": "797.5",
                            "y": "133.33333333333326"
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
                y: 'color',
                guide: {
                    x: {autoScale: false},
                    y: {autoScale: false}
                },
                unit: [
                    {
                        type: 'ELEMENT.INTERVAL',
                        flip: false
                    }
                ]
            }
        },
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign

                    [
                        {
                            "x": "0",
                            "y": "666.6666666666666"
                        },
                        {
                            "x": "266.66666666666663",
                            "y": "399.99999999999994"
                        },
                        {
                            "x": "533.3333333333334",
                            "y": "133.33333333333326"
                        },
                        {
                            "x": "533.3333333333334",
                            "y": "399.99999999999994"
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
                guide: {
                    x: {autoScale: false},
                    y: {autoScale: false}
                },
                unit: [
                    {
                        type: 'ELEMENT.INTERVAL',
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
                assert.ok(schemes.bar(chart.config.spec), 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign
                    [
                        {
                            "x": "229",
                            "y": "533.3333333333333"
                        }
                    ],
                    [
                        {
                            "x": "229",
                            "y": "266.66666666666663"
                        },
                        {
                            "x": "229",
                            "y": "-8.526512829121202e-14"
                        }
                    ],
                    [
                        {
                            "x": "0",
                            "y": "-8.526512829121202e-14"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH TWO LINEAR AXIS",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
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
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign

                    [
                        {
                            "x": "0",
                            "y": "454.5"
                        },
                        {
                            "x": "0",
                            "y": "511.5"
                        },
                        {
                            "x": "0",
                            "y": "797.5"
                        },
                        {
                            "x": "0",
                            "y": "-2.5"
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
                y: 'color',
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
        testData,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign

                    [
                        {
                            "x": "0",
                            "y": "533.3333333333333"
                        },
                        {
                            "x": "0",
                            "y": "266.66666666666663"
                        },
                        {
                            "x": "0",
                            "y": "-8.526512829121202e-14"
                        },
                        {
                            "x": "0",
                            "y": "266.66666666666663"
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
            "createDate": new Date(iso("2014-09-02T21:00:00")),
            "count": 123
        },
        {
            "createDate": new Date(iso("2014-09-29T21:00:00")),
            "count": 34
        },
        {
            "createDate": new Date(iso("2014-10-13T21:00:00")),
            "count": 2
        }
    ];

    describePlot(
        "ELEMENT.INTERVAL WITH TWO ORDER AXIS",
        {
            dimensions: {
                "createDate": {
                    "type": "order",
                    "scale": "period"
                },
                "count": {
                    "type": "measure"
                }
            },
            unit: {
                type: 'COORDS.RECT',
                x: 'createDate',
                y: 'count',
                guide: {
                    "x": {
                        "label": "Create Date",
                        "autoScale": true,
                        "tickFormat": "%j",
                        "tickPeriod": "day"
                    }
                },
                unit: [
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
                    //generate with help generateCoordIfChangeDesign


                    [
                        {
                            "x": "0",
                            "y": "43"
                        },
                        {
                            "x": "514.2857",
                            "y": "591"
                        },
                        {
                            "x": "780.9524",
                            "y": "788"
                        }
                    ]


                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH TWO ORDER AXIS",
        {
            dimensions: {
                "createDate": {
                    "type": "order",
                    "scale": "period"
                },
                "count": {
                    "type": "measure"
                }
            },
            unit: {
                type: 'COORDS.RECT',
                y: 'createDate',
                x: 'count',
                guide: {
                    "y": {
                        "label": "Create Date",
                        "autoScale": true,
                        "tickPeriod": "day",
                        "tickFormat": "%j"
                    }
                },
                unit: [
                    {
                        type: 'ELEMENT.INTERVAL',
                        flip: true
                    }
                ]
            }
        },
        dataWithDate,
        function () {
            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    //generate with help generateCoordIfChangeDesign
                    [
                        {
                            "x": "0",
                            "y": "780.9524"
                        },
                        {
                            "x": "0",
                            "y": "266.6667"
                        },
                        {
                            "x": "0",
                            "y": "-0.000000001"
                        }
                    ]
                ]);
            });
        }
    );

    describePlot(
        "ELEMENT.INTERVAL WITH MEASURE (:time) as X / MEASURE (:number) AXIS as Y",
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
                        type: 'ELEMENT.INTERVAL'
                    }
                ]
            }
        },
        [
            {time: testUtils.toLocalDate('2014-02-03'), count: 0},
            {time: testUtils.toLocalDate('2014-02-02'), count: 5},
            {time: testUtils.toLocalDate('2014-02-01'), count: 10}
        ],
        function () {
            it("should group contain interval element", function () {

                var minimalHeight = 1;

                var coords = [
                    [
                        800,
                        400,
                        minimalHeight
                    ]
                ];

                var bars = getGroupBar();

                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'height'))).to.equal(coords[barIndex][elIndex]);
                    });
                });
            });
        });

    describePlot(
        "ELEMENT.INTERVAL.FLIP WITH MEASURE (:number) AXIS as X / MEASURE (:time) as Y",
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
                        type: 'ELEMENT.INTERVAL',
                        flip: true
                    }
                ]
            }
        },
        [
            {time: testUtils.toLocalDate('2014-02-03'), count: 0},
            {time: testUtils.toLocalDate('2014-02-02'), count: 5},
            {time: testUtils.toLocalDate('2014-02-01'), count: 10}
        ],
        function () {
            it("should group contain interval element", function () {

                var minimalHeight = 1;

                var coords = [
                    [
                        800,
                        400,
                        minimalHeight
                    ]
                ];

                var bars = getGroupBar();

                _.each(bars, function (bar, barIndex) {
                    _.each(bar.childNodes, function (el, elIndex) {
                        expect(parseFloat(attrib(el, 'width'))).to.equal(coords[barIndex][elIndex]);
                    });
                });
            });
        });

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
                it('test position',function(){
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
    );
});