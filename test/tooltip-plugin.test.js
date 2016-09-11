// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks

var $ = require('jquery');
var expect = require('chai').expect;
var testUtils = require('testUtils');
var stubTimeout = testUtils.stubTimeout;
var tauCharts = require('tauCharts');
var tooltip = require('plugins/tooltip');
var describeChart = testUtils.describeChart;

var iso = function (str) {
    var offsetHrs = new Date(str).getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    return (str + '+' + offsetISO);
};

var showTooltip = function (expect, chart, index, selectorClass) {
    var d = testUtils.Deferred();
    var selectorCssClass = selectorClass || '.i-role-datum';
    var datum = chart.getSVG().querySelectorAll(selectorCssClass)[index || 0];
    testUtils.simulateEvent('mouseover', datum);
    return d.resolve(document.querySelectorAll('.graphical-report__tooltip'));
};

var hideTooltip = function (expect, chart, index, selectorClass) {
    var d = testUtils.Deferred();
    var selectorCssClass = selectorClass || '.i-role-datum';
    var datum = chart.getSVG().querySelectorAll(selectorCssClass)[index || 0];
    testUtils.simulateEvent('mouseout', datum);
    return d.resolve(document.querySelectorAll('.graphical-report__tooltip__content'));
};

var getSelectorByChartType = function (type) {
    return ((type === 'line') || (type === 'area')) ? '.i-data-anchor': null;
};

var chartType = ['area', 'line', 'scatterplot', 'bar', 'horizontal-bar', 'stacked-bar', 'horizontal-stacked-bar'];

chartType.forEach(function (item) {
    var tooltipEl = null;
    describeChart(
        "tooltip for " + item,
        {
            type: item,
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [
                tooltip({
                    afterInit: el => tooltipEl = el
                })
            ]
        },
        [
            {
                x: 2,
                y: 2,
                color: 'yellow'
            },
            {
                x: 4,
                y: 2,
                color: 'yellow'
            },
            {
                x: 5,
                y: 2,
                color: 'yellow'
            },
            {
                x: 2,
                y: 10,
                color: 'green'
            },
            {
                x: 6,
                y: 10,
                color: 'green'
            }
        ],
        function (context) {
            it("should work", function (done) {
                var originTimeout = stubTimeout();
                this.timeout(5000);
                showTooltip(expect, context.chart, 0, getSelectorByChartType(item))
                    .then(function (content) {
                        var items = content[0].querySelectorAll('.graphical-report__tooltip__list__item');
                        expect(items[0].textContent).to.be.equal('x2');
                        expect(items[1].textContent).to.be.equal('y2');
                        expect(items[2].textContent).to.be.equal('coloryellow');
                    })
                    .then(function () {
                        return hideTooltip(expect, context.chart, 0, getSelectorByChartType(item));
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip__content');
                        expect(content.length).to.equal(0);
                        return showTooltip(expect, context.chart, 0, getSelectorByChartType(item));
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip__content');
                        expect(content.length).to.be.above(0);
                        var excluder = document.querySelectorAll('.i-role-exclude')[0];
                        testUtils.simulateEvent('click', excluder);
                        var d = testUtils.Deferred();
                        content = document.querySelectorAll('.graphical-report__tooltip__content');
                        expect(content.length).to.equal(0);
                        var data = context.chart.getChartModelData();
                        var expected = tauCharts.api._.sortBy(data, function (a) {
                            return a.x;
                        });
                        expect(expected).to.be.eql([
                            {
                                x: 2,
                                y: 10,
                                color: 'green'
                            },
                            {
                                x: 4,
                                y: 2,
                                color: 'yellow'
                            },
                            {
                                x: 5,
                                y: 2,
                                color: 'yellow'
                            },
                            {
                                x: 6,
                                y: 10,
                                color: 'green'
                            }
                        ]);

                        return d.resolve();
                    })
                    .then(function () {
                        return showTooltip(expect, context.chart, 0, getSelectorByChartType(item));
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip__content');
                        expect(content.length).to.be.above(0);
                        context.chart.destroy();
                        content = document.querySelectorAll('.graphical-report__tooltip__content');
                        expect(content.length).to.equal(0);
                        window.setTimeout = originTimeout;
                        return hideTooltip(expect, context.chart, 0, getSelectorByChartType(item));
                    })
                    .always(function () {
                        window.setTimeout = originTimeout;
                        done();
                    });
            });
        },
        {
            autoWidth: true
        }
    );
});

describeChart(
    "tooltip for line chart",
    {
        type: 'line',
        x: 'x',
        y: 'y',
        plugins: [tooltip()]
    },
    [
        {x: 2, y: 2},
        {x: 4, y: 5}
    ],
    function (context) {
        it("should work tooltip", function (done) {
            var originTimeout = stubTimeout();
            this.timeout(5000);
            showTooltip(expect, context.chart)
                .then(function () {
                    var excluder = document.querySelectorAll('.i-role-exclude')[0];
                    testUtils.simulateEvent('click', excluder);
                    var d = testUtils.Deferred();
                    var data = context.chart.getChartModelData();
                    var expected = tauCharts.api._.sortBy(data, function (a) {
                        return a.x;
                    });
                    expect(expected).to.be.eql([
                        {
                            x: 4,
                            y: 5
                        }
                    ]);
                    return d.resolve();
                })
                .then(function () {
                    return hideTooltip(expect, context.chart);
                })
                .always(function () {
                    window.setTimeout = originTimeout;
                    done();
                });
        });
    }
);

chartType.forEach(function (item) {

    var elementSelector = (item === 'area') ? getSelectorByChartType(item) : null;

    describeChart(
        "tooltip getFields for " + item,
        {
            type: item,
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [tooltip({
                getFields: function (chart) {
                    expect(chart).to.be.ok;
                    if (chart.getChartModelData()[0].x === 2) {
                        return ['x', 'color'];
                    }
                    return ['y'];
                }
            })]
        },
        [{
            x: 2,
            y: 2,
            color: 'yellow'
        }],
        function (context) {
            it('should support getFields parameter', function (done) {
                var originTimeout = stubTimeout();
                showTooltip(expect, context.chart, 0, elementSelector)
                    .then(function (content) {
                        expect(content.length).to.be.above(0);
                        var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip__list__elem');
                        var texts = _.pluck(tooltipElements, 'textContent');
                        expect(texts).to.be.eql(['x', '2', 'color', 'yellow']);

                        return hideTooltip(expect, context.chart, 0, elementSelector);
                    })
                    .then(function () {
                        context.chart.setData([{
                            x: 3,
                            y: 3,
                            color: 'red'
                        }]);

                        return showTooltip(expect, context.chart, 0, elementSelector);
                    })
                    .then(function (content) {
                        expect(content.length).to.be.above(0);
                        var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip__list__elem');
                        var texts = _.pluck(tooltipElements, 'textContent');
                        expect(texts).to.be.eql(['y', '3']);
                        return hideTooltip(expect, context.chart, 0, elementSelector);
                    })
                    .always(function () {
                        window.setTimeout = originTimeout;
                        done();
                    });
            });
        }
    );
});

describeChart("tooltip formatting",
    {
        "type": "scatterplot",
        "color": "colorValue",
        "size": "sizeValue",
        "x": [
            "complex"
        ],
        "y": [
            "date",
            "simple"
        ],
        "guide": [
            {
                "y": {
                    "label": "Create Date By Day",
                    "tickPeriod": "day"
                }
            },
            {
                "x": {
                    "label": "Project",
                    "tickLabel": "name"
                },
                "y": {
                    "label": "Progress",
                    "tickFormat": "percent"
                },
                "color": {
                    "label": "Entity Type"
                },
                "size": {
                    "label": "Effort"
                }
            }
        ],
        "dimensions": {
            "complex": {
                "type": "category",
                "scale": "ordinal",
                "value": "id"
            },
            "date": {
                "type": "order",
                "scale": "period"
            },
            "simple": {
                "type": "measure",
                "scale": "linear"
            },
            "colorValue": {
                "type": "category",
                "scale": "ordinal"
            },
            "sizeValue": {
                "type": "measure",
                "scale": "linear"
            }
        },
        plugins: [
            tooltip({
                fields: ['complex', 'date', 'simple', 'colorValue', 'sizeValue', '__blahblah', '__asisName', '__nullProp'],
                formatters: {
                    colorValue: function (srcVal) {
                        return ['(', srcVal, ')'].join('');
                    },
                    sizeValue: '%',
                    __blahblah: {label: 'ImportantField', format: '%'},
                    __asisName: {label: 'SimpleName'},
                    __nullProp: {label: 'NullProp', nullAlias: 'No such prop'},
                    date: {"label": "Create Date Day"}
                }
            })
        ]
    },
    [
        {
            "complex": {
                "id": 1,
                "name": "TP3"
            },
            "date": new Date(iso("2015-01-08T00:00:00")),
            "simple": 0.1,
            "colorValue": "UserStory",
            "sizeValue": 10,
            "__blahblah": 2,
            "__nullProp": null,
            "__asisName": 22
        },
        {
            "complex": null,
            "date": new Date(iso("2015-01-09T00:00:00")),
            "simple": 0.9,
            "colorValue": "Bug",
            "sizeValue": 20,
            "__blahblah": 3,
            "__nullProp": 'Hi',
            "__asisName": 33
        }
    ],
    function (context) {

        it('should format labels', function (done) {

            var originTimeout = stubTimeout();

            var validateLabel = function ($content, label, value) {
                var $label = $content
                    .find('.graphical-report__tooltip__list__elem:contains("' + label + '"):first').parent();

                expect($label.length).to.be.eql(1, 'Label ' + label + ' present');
                expect($label.children()[1].innerText).to.be.eql(value, 'Label value is correct');
            };

            showTooltip(expect, context.chart, 1)
                .then(function (content) {
                    var $content = $(content);
                    validateLabel($content, 'Project', 'No Project');
                    validateLabel($content, 'Create Date Day', '09-Jan');
                    validateLabel($content, 'Progress', '90%');
                    validateLabel($content, 'Entity Type', '(Bug)');
                    validateLabel($content, 'Effort', '2000%');
                    validateLabel($content, 'ImportantField', '300%');
                    validateLabel($content, 'SimpleName', '33');
                    validateLabel($content, 'NullProp', 'Hi');
                    return hideTooltip(expect, context.chart, 0);
                })
                .then(function () {
                    return showTooltip(expect, context.chart, 0);
                })
                .then(function (content) {
                    var $content = $(content);
                    validateLabel($content, 'Project', 'TP3');
                    validateLabel($content, 'Create Date Day', '08-Jan');
                    validateLabel($content, 'Effort', '1000%');
                    validateLabel($content, 'Entity Type', '(UserStory)');
                    validateLabel($content, 'Progress', '10%');
                    validateLabel($content, 'ImportantField', '200%');
                    validateLabel($content, 'SimpleName', '22');
                    validateLabel($content, 'NullProp', 'No such prop');
                    return hideTooltip(expect, context.chart, 1);
                })
                .always(function () {
                    window.setTimeout = originTimeout;
                    done();
                });
        });
    });

describeChart(
    'tooltip for area chart',
    {
        type: 'area',
        x: 'x',
        y: 'y',
        plugins: [tooltip()]
    },
    [
        {x: 2, y: 2},
        {x: 4, y: 5}
    ],
    function (context) {
        it('should work on mousemove', function (done) {
            var originTimeout = stubTimeout();
            this.timeout(5000);

            var selectorCssClass = getSelectorByChartType('area');
            var datum = context.chart.getSVG().querySelectorAll(selectorCssClass)[0];
            testUtils.simulateEvent('mousemove', datum);

            var content = document.querySelectorAll('.graphical-report__tooltip');

            var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip__list__elem');
            var texts = _.pluck(tooltipElements, 'textContent');
            expect(texts).to.be.eql(['x', '2', 'y', '2']);

            testUtils.simulateEvent('mouseout', datum);

            window.setTimeout = originTimeout;
            done();
        });
    }
);

describe('tooltip', function () {

    var div1;

    var createDiv = function () {
        var div = document.createElement('div');
        div.style.width = 600 + 'px';
        div.style.height = 800 + 'px';
        document.body.appendChild(div);
        return div;
    };

    beforeEach(function () {
        tauCharts.Chart.winAware = [];
        div1 = createDiv();
    });

    afterEach(function () {
        div1.parentNode.removeChild(div1);
    });

    it('should support reveal feature', function (done) {

        var chart1 = new tauCharts.Chart({
            type: 'bar',
            x: 'x',
            y: 'count',
            data: [
                {x: 2, count: 2},
                {x: 4, count: 5}
            ],
            plugins: [
                tooltip({
                    aggregationGroupFields: ['x'],
                    onRevealAggregation: function (filterDescriptor, data) {
                        expect(filterDescriptor).to.deep.equal({x: 2});
                        done();
                    }
                })
            ]
        });

        chart1.renderTo(div1);

        showTooltip(expect, chart1)
            .then(function (content) {
                var reveal = content[0].querySelectorAll('.i-role-reveal');
                expect(reveal.length).to.be.equal(1);
                var revealBtn = reveal[0];
                testUtils.simulateEvent('click', revealBtn);
            });
    });
});