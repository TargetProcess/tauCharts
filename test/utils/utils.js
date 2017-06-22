import tauCharts from '../../src/tau.charts';
import $ from 'jquery';
import * as utils from '../../src/utils/utils';
import * as d3 from 'd3';

tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;
tauCharts.api.globalSettings.asyncRendering = false;
tauCharts.api.globalSettings.avoidScrollAtRatio = 1;
tauCharts.api.globalSettings.syncPointerEvents = true;
tauCharts.api.globalSettings.handleRenderingErrors = false;
tauCharts.api.globalSettings.experimentalShouldAnimate = () => true;

    var testChartSettings = {
        getAxisTickLabelSize: function (text) {
            return {
                width: text.length * 5,
                height: 10
            };
        },
        experimentalShouldAnimate: () => true,

        fitModel: null, // 'entire-view',
        layoutEngine: '', // 'EXTRACT'
        autoRatio: true,
        syncPointerEvents: true,
        handleRenderingErrors: false,

        getScrollbarSize: function () {
            return {width: 10, height: 10};
        },

        xAxisTickLabelLimit: 100,
        yAxisTickLabelLimit: 100,

        xTickWordWrapLinesLimit: 2,
        yTickWordWrapLinesLimit: 3,

        xTickWidth: 6 + 3,
        yTickWidth: 6 + 3,

        distToXAxisLabel: 20,
        distToYAxisLabel: 20,

        xAxisPadding: 20,
        yAxisPadding: 20,

        xFontLabelDescenderLineHeight: 4,
        xFontLabelHeight: 15,
        yFontLabelHeight: 15,

        "xDensityPadding": 4,
        "xDensityPadding:measure": 8,
        "yDensityPadding": 4,
        "yDensityPadding:measure": 8,

        defaultFormats: {
            'measure': 'x-num-auto',
            'measure:time': 'x-time-auto',
            'measure:time:year': 'year',
            'measure:time:quarter': 'quarter',
            'measure:time:month': 'month',
            'measure:time:week': 'x-time-auto',
            'measure:time:day': 'x-time-auto',
            'measure:time:hour': 'x-time-auto',
            'measure:time:min': 'x-time-auto',
            'measure:time:sec': 'x-time-auto',
            'measure:time:ms': 'x-time-auto'
        },

        log: (msg, type) => {
            type = type || 'INFO';
            if (!Array.isArray(msg)) {
                msg = [msg];
            }
            console[type.toLowerCase()].apply(console, msg);
        }
    };

    function getDots() {
        return d3.selectAll('.dot').nodes();
    }

    function getLine() {
        return d3.selectAll('.line').nodes();
    }

    function getArea() {
        return d3.selectAll('.area').nodes();
    }

    function getGroupBar() {
        return [d3.select('.bar').node().parentNode];
    }

    function attrib(el, prop) {
        return el.getAttribute(prop);
    }

    var hasClass = function (element, value) {
        return attrib(element, 'class').indexOf(value) !== -1;
    };

    var position = function (el) {
        return {x: attrib(el, 'cx'), y: attrib(el, 'cy')};
    };

    var toLocalDate = function (str) {
        var offsetHrs = new Date().getTimezoneOffset() / 60;
        var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
        if (str.indexOf('T') === -1) {
            str += 'T00:00:00';
        }
        return new Date(str + '+' + offsetISO);
    };

    function describePlot(name, spec, data, fn) {
        describe(name, function () {
            var context = {
                element: null,
                chart: null
            };

            beforeEach(function () {
                context.element = document.createElement('div');
                document.body.appendChild(context.element);

                tauCharts.Plot.globalSettings = testChartSettings;

                context.chart = new tauCharts.Plot({
                    layoutEngine: 'DEFAULT',
                    specEngine: 'DEFAULT',
                    spec: spec,
                    data: data,
                    settings: {
                        excludeNull: false
                    }
                });

                context.chart.renderTo(context.element, {width: 800, height: 800});
            });

            fn(context);

            afterEach(function () {
                context.element.parentNode.removeChild(context.element);
            });
        });
    }

    function describeChart(name, config, data, fn, options) {
        options = utils.defaults(options || {}, {autoResize: false});
        config.data = data;
        describe(name, function () {
            var context = {
                element: null,
                chart: null
            };

            beforeEach(function () {
                tauCharts.Chart.winAware = [];
                context.element = document.createElement('div');
                context.element.setAttribute('data-chart-id', name);
                document.body.appendChild(context.element);

                tauCharts.Plot.globalSettings = testChartSettings;

                context.chart = new tauCharts.Chart(config);
                if (options.autoWidth) {
                    context.chart.renderTo(context.element);
                } else {
                    context.chart.renderTo(context.element, {width: 800, height: 800});
                }

            });

            fn(context);

            afterEach(function () {
                context.chart.destroy();
                context.element.parentNode.removeChild(context.element);
            });
        });
    }

    function stubTimeout() {
        var originTimeout = window.setTimeout;
        window.setTimeout = function () {
            var arg = Array.prototype.slice.call(arguments, 0, 1);
            arguments[0].apply(null, arg);
        };

        return originTimeout;
    }

    // NOTE: To prevent layout jumps when content changes and scrollbar appears,
    // currently padding is added as a placeholder for missing scrollbar.
    var noScrollStyle = {
        create: function () {
            var style = document.getElementById('noScrollStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'noScrollStyle';
                style.textContent = [
                    '.graphical-report__layout__content, .graphical-report__layout__sidebar-right {',
                    '  overflow: visible !important;',
                    '  padding: 0 !important;',
                    '}'
                ].join('\n');
                document.head.appendChild(style);
            }
        },
        remove: function () {
            var style = document.getElementById('noScrollStyle');
            if (style) {
                document.head.removeChild(style);
            }
        }
    };

    function destroyCharts() {
        tauCharts.Chart.winAware
            .slice(0)
            .forEach(function (chart) {
                chart.destroy();
            });
    }

    function roundNumbersInString(str, fractionDigits) {
        return str.replace(/-?\d+\.?\d*/g, function (match) {
            return parseFloat(match).toFixed(fractionDigits);
        });
    }

    function elementFromPoint(x, y) {
        var scrollX = window.pageXOffset;
        var scrollY = window.pageYOffset;
        window.scrollTo(x, y);
        var el = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
        window.scrollTo(scrollX, scrollY);
        return el;
    }

export default {
        toLocalDate: toLocalDate,
        roundNumbersInString: roundNumbersInString,
        describePlot: describePlot,
        describeChart: describeChart,
        getDots: getDots,
        getLine: getLine,
        getArea: getArea,
        attrib: attrib,
        hasClass: hasClass,
        position: position,
        getGroupBar: getGroupBar,
        Deferred: $.Deferred,
        stubTimeout:stubTimeout,
        chartSettings: testChartSettings,
        simulateEvent: function (name, element, clientX = 0, clientY = 0) {
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(name, true, true, window,
                0, 0, 0, clientX, clientY, false, false, false, false, 0, null);
            element.dispatchEvent(evt);
        },
        elementFromPoint,
        noScrollStyle,
        destroyCharts
    };
