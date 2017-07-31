// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
import $ from 'jquery';
import {expect} from 'chai';
import testUtils from './utils/utils';
const {stubTimeout, describeChart} = testUtils;
import Taucharts from '../src/tau.charts';
import tooltip from '../plugins/tooltip';

var iso = function (str) {
    var offsetHrs = new Date(str).getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    return (str + '+' + offsetISO);
};

var getElementPosition = (element) => {
    var rect = element.getBoundingClientRect();
    return {
        x: ((rect.left + rect.right) / 2),
        y: ((rect.top + rect.bottom) / 2)
    };
};

var showTooltip = function (expect, chart, index, selectorClass, data) {
    var d = testUtils.Deferred();
    selectorClass = selectorClass || '.i-role-datum';
    index = index || 0;
    var element;
    var elements = Array.prototype.slice.call(chart.getSVG().querySelectorAll(selectorClass), 0);
    if (data) {
        // NOTE: Elements order changes after hover.
        data = data.filter(d => elements.filter(el => el.__data__ === d).length);
        element = elements.filter(el => el.__data__ === data[index])[0];
    } else {
        element = elements[index];
    }
    var {x, y} = getElementPosition(element);
    testUtils.simulateEvent('mousemove', element, x, y);
    return d.resolve(document.querySelectorAll('.graphical-report__tooltip-v2'));
};

var hideTooltip = function (expect, chart) {
    var d = testUtils.Deferred();
    testUtils.simulateEvent('mousemove', chart.getSVG(), 0, 0);
    return d.resolve(document.querySelectorAll('.graphical-report__tooltip-v2__content'));
};

var getSelectorByChartType = function (type) {
    return ((type === 'line') || (type === 'area')) ? '.i-data-anchor': null;
};

var chartType = ['area', 'line', 'scatterplot', 'bar', 'horizontal-bar', 'stacked-bar', 'horizontal-stacked-bar'];

chartType.forEach(function (item) {
    var tooltipEl = null;
    var data = [
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
    ];
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
        data,
        function (context) {
            it("should work", function (done) {
                var originTimeout = stubTimeout();
                this.timeout(5000);
                showTooltip(expect, context.chart, 0, getSelectorByChartType(item), data)
                    .then(function (content) {
                        var items = content[0].querySelectorAll('.graphical-report__tooltip-v2__list__item');
                        expect(items[0].textContent).to.be.equal('x2');
                        expect(items[1].textContent).to.be.equal('y2');
                        expect(items[2].textContent).to.be.equal('coloryellow');
                    })
                    .then(function () {
                        return hideTooltip(expect, context.chart, 0, getSelectorByChartType(item), data);
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip-v2__content');
                        expect(content.length).to.equal(0);
                        return showTooltip(expect, context.chart, 0, getSelectorByChartType(item), data);
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip-v2__content');
                        expect(content.length).to.be.above(0);
                        var excluder = document.querySelectorAll('.i-role-exclude')[0];
                        testUtils.simulateEvent('click', excluder);
                        var d = testUtils.Deferred();
                        content = document.querySelectorAll('.graphical-report__tooltip-v2__content');
                        expect(content.length).to.equal(0);
                        var data = context.chart.getChartModelData();
                        var expected = data.sort((a1, a2) => a1.x - a2.x);
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
                        return showTooltip(expect, context.chart, 0, getSelectorByChartType(item), data);
                    })
                    .then(function () {
                        var content = document.querySelectorAll('.graphical-report__tooltip-v2__content');
                        expect(content.length).to.be.above(0);
                        context.chart.destroy();
                        content = document.querySelectorAll('.graphical-report__tooltip-v2__content');
                        expect(content.length).to.equal(0);
                        window.setTimeout = originTimeout;
                        return hideTooltip(expect, context.chart, 0, getSelectorByChartType(item), data);
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
            showTooltip(expect, context.chart, 0, getSelectorByChartType('line'))
                .then(function () {
                    var excluder = document.querySelectorAll('.i-role-exclude')[0];
                    testUtils.simulateEvent('click', excluder);
                    var d = testUtils.Deferred();
                    var data = context.chart.getChartModelData();
                    var expected = data.sort((a1, a2) =>a1.x - a2.x);
                    expect(expected).to.be.eql([{x: 4, y: 5}]);
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
                        var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip-v2__list__elem');
                        var texts = Array.from(tooltipElements).map((x) => x.textContent);
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
                        var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip-v2__list__elem');
                        var texts = Array.from(tooltipElements).map((x) => x.textContent);
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
                    .find('.graphical-report__tooltip-v2__list__elem:contains("' + label + '"):first').parent();

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
            var {x, y} = getElementPosition(datum)
            testUtils.simulateEvent('mousemove', datum, x, y);

            var content = document.querySelectorAll('.graphical-report__tooltip-v2');

            var tooltipElements = content[0].querySelectorAll('.graphical-report__tooltip-v2__list__elem');
            var texts = Array.from(tooltipElements).map((x) => x.textContent);
            expect(texts).to.be.eql(['x', '2', 'y', '2']);

            testUtils.simulateEvent('mousemove', context.chart.getSVG(), 0, 0);

            window.setTimeout = originTimeout;
            done();
        });
    }
);
