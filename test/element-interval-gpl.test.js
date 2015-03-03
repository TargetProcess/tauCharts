// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var assert = require('chai').assert;
    var tauCharts = require('tau_modules/tau.charts');
    var testUtils = require('testUtils');
    var getGroupBar = testUtils.getGroupBar;
    var attrib = testUtils.attrib;
    var _ = require('underscore');

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
                        color: {type: 'category'}
                    },
                    data: data
                }
            },
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
            scales: {
                'x': {type: 'ordinal', source: '/', dim: 'x'},
                'y': {type: 'linear', source: '/', dim: 'y'},
                'size:default': {type: 'size', source: '?', mid: 5},
                'color': {type: 'color', dim: 'color', source: '/'},
                'color:default': {type: 'color', source: '?', brewer: null}
            },
            unit: {
                type: 'RECT',
                expression: {
                    inherit: false,
                    source: '/',
                    operator: 'none'
                },
                x: unit.x,
                y: unit.y,
                units: [{
                    type: 'INTERVAL',
                    x: unit.unit[0].x || unit.x,
                    y: unit.unit[0].y || unit.y,
                    color: 'color',
                    expression: {
                        inherit: true,
                        source: '/',
                        operator: 'groupBy',
                        params: ['color']
                    }
                }]
            }
        }
    };

    var describePlot = function d(name, spec, data, fn) {

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
    };

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
                assert.ok(!schemes.barGPL.errors(chart.config), 'spec is right');
                expect(getGroupBar().length).to.equal(3);
            });

            it("should group contain interval element", function () {
                expectCoordsElement(expect, [
                    [
                        {
                            "x": "0",
                            "y": "429"
                        }
                    ],
                    [
                        {
                            "x": "250",
                            "y": "482"
                        },
                        {
                            "x": "500",
                            "y": "0"
                        }
                    ],
                    [
                        {
                            "x": "500",
                            "y": "536"
                        }
                    ]
                ]);
            });
        }
    );
});