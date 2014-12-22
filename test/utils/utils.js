define(function (require) {
    var tauCharts = require('tau_modules/tau.newCharts'),
        $ = require('jquery'),
        d3 = require('d3');

    var testChartSettings = {
        getAxisTickLabelSize: function (text) {
            return {
                width: text.length * 5,
                height: 10
            };
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

        xFontLabelHeight: 15,
        yFontLabelHeight: 15,

        xDensityKoeff: 2.2,
        yDensityKoeff: 2.2,

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
        }
    };

    function getDots() {
        return d3.selectAll('.dot')[0];
    }

    function getLine() {
        return d3.selectAll('.line')[0];
    }

    function getGroupBar() {
        return d3.selectAll('.i-role-bar-group')[0];
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
        options = _.defaults(options || {}, {autoResize: false});
        config.data = data;
        describe(name, function () {
            var context = {
                element: null,
                chart: null
            };

            beforeEach(function () {
                tauCharts.Chart.winAware = [];
                context.element = document.createElement('div');
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
                context.element.parentNode.removeChild(context.element);
            });
        });
    }

    return {
        toLocalDate: toLocalDate,
        describePlot: describePlot,
        describeChart: describeChart,
        getDots: getDots,
        getLine: getLine,
        attrib: attrib,
        hasClass: hasClass,
        position: position,
        getGroupBar: getGroupBar,
        Deferred: $.Deferred,
        chartSettings: testChartSettings,
        simulateEvent: function (name, element) {
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(name, true, true, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(evt);
        }
    };
});
