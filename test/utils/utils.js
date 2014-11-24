define(function (require) {
    var tauChart = require('tau_modules/tau.newCharts'),
        d3 = require('d3');

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
        return el.getAttribute(prop)
    }

    var hasClass = function (element, value) {
        return attrib(element, 'class').indexOf(value) !== -1;
    };

    function position(el) {
        return {x: attrib(el, 'cx'), y: attrib(el, 'cy')}
    }

    function describePlot(name, spec, data, fn) {
        describe(name, function () {
            var context = {
                element: null,
                chart: null
            };

            beforeEach(function () {
                context.element = document.createElement('div');
                document.body.appendChild(context.element);
                context.chart = new tauChart.Plot({
                    layoutEngine: 'DEFAULT',
                    specEngine: 'DEFAULT',
                    excludeNull: false,
                    spec: spec,
                    data: data
                });
                context.chart.renderTo(context.element, {width: 800, height: 800});
            });

            fn(context);

            afterEach(function () {
                context.element.parentNode.removeChild(context.element);
            });
        });
    }


    return {
        describePlot: describePlot,
        getDots: getDots,
        getLine: getLine,
        attrib: attrib,
        hasClass: hasClass,
        position: position,
        getGroupBar: getGroupBar,
        chartSettings: {
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
                'measure:time:year': 'x-time-year',
                'measure:time:quarter': 'x-time-quarter',
                'measure:time:month': 'x-time-month',
                'measure:time:week': 'x-time-week',
                'measure:time:day': 'x-time-day',
                'measure:time:hour': 'x-time-hour',
                'measure:time:min': 'x-time-min',
                'measure:time:sec': 'x-time-sec',
                'measure:time:ms': 'x-time-ms'
            }
        }
    }
});
