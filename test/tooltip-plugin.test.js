// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks

define(function (require) {

    var $ = require('jquery');
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var stubTimeout = testUtils.stubTimeout;
    var tauCharts = require('tauCharts');
    var tooltip = require('plugins/tooltip');
    var describeChart = testUtils.describeChart;

    var offsetHrs = new Date().getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    var iso = function (str) {
        return (str + '+' + offsetISO);
    };
    return;
    var showTooltip = function (expect, chart, index) {
        var d = testUtils.Deferred();
        var datum = chart.getSVG().querySelectorAll('.i-role-datum')[index || 0];
        testUtils.simulateEvent('mouseover', datum);
        return d.resolve(document.querySelectorAll('.graphical-report__tooltip'));
    };
    var hideTooltip = function (expect, chart, index) {
        var d = testUtils.Deferred();
        var datum = chart.getSVG().querySelectorAll('.i-role-datum')[index || 0];
        testUtils.simulateEvent('mouseout', datum);
        return d.resolve(document.querySelectorAll('.graphical-report__tooltip__content'));
    };
    if (false) {

        var chartType = ['scatterplot', 'line', 'bar', 'horizontalBar'];

        chartType.forEach(function (item) {
            describeChart(
                "tooltip for " + item,
                {
                    type: item,
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    plugins: [tooltip()]
                },
                [{
                    x: 2,
                    y: 2,
                    color: 'yellow'

                }, {
                    x: 4,
                    y: 2,
                    color: 'yellow'

                }, {
                    x: 5,
                    y: 2,
                    color: 'yellow'

                }, {
                    x: 2,
                    y: 1,
                    color: 'green'

                }, {
                    x: 6,
                    y: 1,
                    color: 'green'

                }],
                function (context) {
                    it("should work", function (done) {
                        var originTimeout = stubTimeout();
                        this.timeout(5000);
                        showTooltip(expect, context.chart)
                            .then(function (content) {
                                var items = content[0].querySelectorAll('.graphical-report__tooltip__list__item');
                                expect(items[0].textContent).to.be.equal('x2');
                                expect(items[1].textContent).to.be.equal('y2');
                                expect(items[2].textContent).to.be.equal('coloryellow');
                            })
                            .then(function () {
                                return hideTooltip(expect, context.chart);
                            })
                            .then(function () {
                                var content = document.querySelectorAll('.graphical-report__tooltip__content');
                                expect(content.length).not.be.ok();
                                return showTooltip(expect, context.chart);
                            })
                            .then(function () {
                                var content = document.querySelectorAll('.graphical-report__tooltip__content');
                                expect(content.length).to.be.ok();
                                var excluder = document.querySelectorAll('.i-role-exclude')[0];
                                testUtils.simulateEvent('click', excluder);
                                var d = testUtils.Deferred();
                                content = document.querySelectorAll('.graphical-report__tooltip__content');
                                expect(content.length).not.be.ok();
                                var data = context.chart.getData();
                                var expected = tauCharts.api._.sortBy(data, function (a) {
                                    return a.x;
                                });
                                expect(expected).to.be.eql(
                                    [{
                                        x: 2,
                                        y: 1,
                                        color: 'green'

                                    }, {
                                        x: 4,
                                        y: 2,
                                        color: 'yellow'

                                    }, {
                                        x: 5,
                                        y: 2,
                                        color: 'yellow'

                                    }, {
                                        x: 6,
                                        y: 1,
                                        color: 'green'

                                    }]
                                );

                                return d.resolve();
                            }).then(function () {
                                return showTooltip(expect, context.chart);
                            }).then(function () {
                                var content = document.querySelectorAll('.graphical-report__tooltip__content');
                                expect(content.length).to.be.ok();
                                context.chart.destroy();
                                content = document.querySelectorAll('.graphical-report__tooltip__content');
                                expect(content.length).not.be.ok();
                                window.setTimeout = originTimeout;
                                return hideTooltip(expect, context.chart);
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
            "tooltip for line chart without",
            {
                type: 'line',
                x: 'x',
                y: 'y',
                color: 'color',
                plugins: [tooltip()]
            },
            [{
                x: 2,
                y: 2
            }, {
                x: 4,
                y: 5
            }],
            function (context) {
                it("should work tooltip", function (done) {
                    var originTimeout = stubTimeout();
                    this.timeout(5000);
                    showTooltip(expect, context.chart)
                        .then(function () {
                            var excluder = document.querySelectorAll('.i-role-exclude')[0];
                            testUtils.simulateEvent('click', excluder);
                            var d = testUtils.Deferred();
                            var data = context.chart.getData();
                            var expected = tauCharts.api._.sortBy(data, function (a) {
                                return a.x;
                            });
                            expect(expected).to.be.eql(
                                [{
                                    x: 4,
                                    y: 5
                                }]
                            );
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
            describeChart(
                "tooltip getFields for " + item,
                {
                    type: item,
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    plugins: [tooltip({
                        getFields: function (chart) {
                            expect(chart).to.be.ok();

                            if (chart.getData()[0].x === 2) {
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
                        showTooltip(expect, context.chart)
                            .then(function (content) {
                                expect(content.length).to.be.ok();
                                var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip__list__elem');
                                var texts = _.pluck(tooltipElements, 'textContent');
                                expect(texts).to.be.eql(['x', '2', 'color', 'yellow']);

                                return hideTooltip(expect, context.chart);
                            })
                            .then(function () {
                                context.chart.setData([{
                                    x: 3,
                                    y: 3,
                                    color: 'red'
                                }]);

                                return showTooltip(expect, context.chart);
                            })
                            .then(function (content) {
                                expect(content.length).to.be.ok();
                                var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip__list__elem');
                                var texts = _.pluck(tooltipElements, 'textContent');
                                expect(texts).to.be.eql(['y', '3']);
                                return hideTooltip(expect, context.chart);
                            })
                            .always(function () {
                                window.setTimeout = originTimeout;
                                done();
                            });
                    });
                }
            );
        });
    }
    // return;
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
            plugins: [tooltip({fields: ['complex.name', 'date', 'simple', 'colorValue', 'sizeValue']})]
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
                "sizeValue": 10
            },
            {
                "complex": null,
                "date": new Date(iso("2015-01-09T00:00:00")),
                "simple": 0.9,
                "colorValue": "Bug",
                "sizeValue": 20
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
                showTooltip(expect, context.chart, 0)
                    .then(function (content) {
                        var $content = $(content);
                        validateLabel($content, 'Project', 'No Project');
                        validateLabel($content, 'Create Date By Day', '09-Jan-2015');
                        validateLabel($content, 'Progress', '90%');
                        validateLabel($content, 'Entity Type', 'Bug');
                        validateLabel($content, 'Effort', '20');
                        return hideTooltip(expect, context.chart, 0);
                    })
                    .then(function () {
                        return showTooltip(expect, context.chart, 1);
                    })
                    .then(function (content) {
                        var $content = $(content);
                        validateLabel($content, 'Project', 'TP3');
                        validateLabel($content, 'Create Date By Day', '08-Jan-2015');
                        validateLabel($content, 'Effort', '10');
                        validateLabel($content, 'Entity Type', 'UserStory');
                        validateLabel($content, 'Progress', '10%');
                        return hideTooltip(expect, context.chart, 1);
                    })
                    .always(function () {
                        window.setTimeout = originTimeout;
                        done();
                    });
            });
        });
});