(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory();
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var regressionsHub = (function () {

        'use strict';

        var gaussianElimination = function (a, o) {
            var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
            for (i = 0; i < n; i++) {
                maxrow = i;
                for (j = i + 1; j < n; j++) {
                    if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
                        maxrow = j;
                }
                for (k = i; k < n + 1; k++) {
                    tmp = a[k][i];
                    a[k][i] = a[k][maxrow];
                    a[k][maxrow] = tmp;
                }
                for (j = i + 1; j < n; j++) {
                    for (k = n; k >= i; k--) {
                        a[k][j] -= a[k][i] * a[i][j] / a[i][i];
                    }
                }
            }
            for (j = n - 1; j >= 0; j--) {
                tmp = 0;
                for (k = j + 1; k < n; k++)
                    tmp += a[k][j] * x[k];
                x[j] = (a[n][j] - tmp) / a[j][j];
            }
            return (x);
        };

        // GREAT THANKS to Tom Alexander!
        // https://github.com/Tom-Alexander/regression-js
        var methods = {
            linear: function (data) {
                var sum = [0, 0, 0, 0, 0], n = 0, results = [];

                for (; n < data.length; n++) {
                    if (data[n][1]) {
                        sum[0] += data[n][0];
                        sum[1] += data[n][1];
                        sum[2] += data[n][0] * data[n][0];
                        sum[3] += data[n][0] * data[n][1];
                        sum[4] += data[n][1] * data[n][1];
                    }
                }

                var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);

                gradient = isNaN(gradient) ? 0 : gradient;

                var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
                //  var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], data[i][0] * gradient + intercept];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(gradient * 100) / 100 + 'x + ' + Math.round(intercept * 100) / 100;

                return {equation: [gradient, intercept], points: results, string: string};
            },

            exponential: function (data) {
                var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                    if (data[n][1]) {
                        sum[0] += data[n][0];
                        sum[1] += data[n][1];
                        sum[2] += data[n][0] * data[n][0] * data[n][1];
                        sum[3] += data[n][1] * Math.log(data[n][1]);
                        sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
                        sum[5] += data[n][0] * data[n][1];
                    }
                }

                var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
                var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
                var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(A * 100) / 100 + 'e^(' + Math.round(B * 100) / 100 + 'x)';

                return {equation: [A, B], points: results, string: string};
            },

            logarithmic: function (data) {
                var sum = [0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                    if (data[n][1]) {
                        sum[0] += Math.log(data[n][0]);
                        sum[1] += data[n][1] * Math.log(data[n][0]);
                        sum[2] += data[n][1];
                        sum[3] += Math.pow(Math.log(data[n][0]), 2);
                    }
                }

                var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
                var A = (sum[2] - B * sum[0]) / n;

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(A * 100) / 100 + ' + ' + Math.round(B * 100) / 100 + ' ln(x)';

                return {equation: [A, B], points: results, string: string};
            },

            power: function (data) {
                var sum = [0, 0, 0, 0], n = 0, results = [];

                for (len = data.length; n < len; n++) {
                    if (data[n][1]) {
                        sum[0] += Math.log(data[n][0]);
                        sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
                        sum[2] += Math.log(data[n][1]);
                        sum[3] += Math.pow(Math.log(data[n][0]), 2);
                    }
                }

                var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
                var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A * Math.pow(data[i][0], B)];
                    results.push(coordinate);
                }

                var string = 'y = ' + Math.round(A * 100) / 100 + 'x^' + Math.round(B * 100) / 100;

                return {equation: [A, B], points: results, string: string};
            },

            polynomial: function (data, order) {
                if (typeof order == 'undefined') {
                    order = 2;
                }
                var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

                for (; i < k; i++) {
                    for (var l = 0, len = data.length; l < len; l++) {
                        if (data[l][1]) {
                            a += Math.pow(data[l][0], i) * data[l][1];
                        }
                    }
                    lhs.push(a), a = 0;
                    var c = [];
                    for (var j = 0; j < k; j++) {
                        for (var l = 0, len = data.length; l < len; l++) {
                            if (data[l][1]) {
                                b += Math.pow(data[l][0], i + j);
                            }
                        }
                        c.push(b), b = 0;
                    }
                    rhs.push(c);
                }
                rhs.push(lhs);

                var equation = gaussianElimination(rhs, k);

                for (var i = 0, len = data.length; i < len; i++) {
                    var answer = 0;
                    for (var w = 0; w < equation.length; w++) {
                        answer += equation[w] * Math.pow(data[i][0], w);
                    }
                    results.push([data[i][0], answer]);
                }

                var string = 'y = ';

                for (var i = equation.length - 1; i >= 0; i--) {
                    if (i > 1) string += Math.round(equation[i] * 100) / 100 + 'x^' + i + ' + ';
                    else if (i == 1) string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';
                    else string += Math.round(equation[i] * 100) / 100;
                }

                return {equation: equation, points: results, string: string};
            },

            lastvalue: function (data) {
                var results = [];
                var lastvalue = null;
                for (var i = 0; i < data.length; i++) {
                    if (data[i][1]) {
                        lastvalue = data[i][1];
                        results.push([data[i][0], data[i][1]]);
                    }
                    else {
                        results.push([data[i][0], lastvalue]);
                    }
                }

                return {equation: [lastvalue], points: results, string: "" + lastvalue};
            }
        };

        return (function (method, data, order) {
            if (typeof method == 'string') {
                return methods[method](data, order);
            }
        });
    }());

    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;

    var drawTrendLine = function (trendLineId, dots, xScale, yScale, trendColor, container) {

        var trendCssClass = [
            'graphical-report__trendline',

            'graphical-report__line',
            'i-role-element',

            'graphical-report__line-width-1',
            'graphical-report__line-opacity-1',

            trendLineId,
            trendColor].join(' ');

        var line = d3.svg.line()
            .x(function (d) {
                return xScale(d[0]);
            })
            .y(function (d) {
                return yScale(d[1]);
            });

        var updatePaths = function () {
            this.attr('d', line);
        };

        var updateLines = function () {
            this.attr('class', trendCssClass);

            var paths = this.selectAll('path').data(function (d) {
                return [d];
            });
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var lines = container.selectAll('.' + trendLineId).data([dots]);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    };

    var isApplicable = function (dimensions) {
        return function (unitMeta) {
            var isElement = (unitMeta.type && unitMeta.type.indexOf('ELEMENT.') === 0);

            if (!isElement) {
                return false;
            }
            var x = dimensions[unitMeta.x].type;
            var y = dimensions[unitMeta.y].type;
            return _.every([x, y], function (dimType) {
                return dimType && (dimType !== 'category');
            });
        };

    };

    var dfs = function (node, predicate) {
        if (predicate(node)) {
            return node;
        }
        var i, children = node.unit || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = dfs(child, predicate);
            if (found) {
                return found;
            }
        }
    };

    var isElement = function (unitMeta) {
        return (unitMeta.type && unitMeta.type.indexOf('ELEMENT.') === 0);
    };

    function trendline(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                type: 'linear',
                showPanel: true,
                showTrend: true
            });

        return {

            init: function (chart) {

                this._chart = chart;
                var conf = chart.getConfig();
                this._isApplicable = dfs(conf.spec.unit,isApplicable(conf.dimensions));

                if (settings.showPanel) {

                    this._container = chart.insertToRightSidebar(this.containerTemplate);
                    var classToAdd = this._isApplicable ? 'applicable-true' : 'applicable-false';
                    this._container.classList.add(classToAdd);

                    this.uiChangeEventsDispatcher = function (e) {

                        var target = e.target;
                        var selector = target.classList;

                        if (selector.contains('i-role-show-trend')) {
                            settings.showTrend = target.checked;
                        }

                        if (selector.contains('i-role-change-model')) {
                            settings.type = target.value;
                        }

                        this._chart.refresh();

                    }.bind(this);

                    this._container.addEventListener('change', this.uiChangeEventsDispatcher, false);
                }
            },

            onUnitReady: function (chart, unitMeta) {

                if (!settings.showTrend || !isElement(unitMeta) || !this._isApplicable) {
                    return;
                }

                var options = unitMeta.options;

                var x = unitMeta.x.scaleDim;
                var y = unitMeta.y.scaleDim;
                var c = unitMeta.color.scaleDim;

                //var xAutoScaleVals = unitMeta.scaleMeta(x, unitMeta.guide.x).values;
                var yAutoScaleVals = unitMeta.scaleMeta(y, unitMeta.guide.y).values;

                var minY = _.min(yAutoScaleVals);
                var maxY = _.max(yAutoScaleVals);

                var categories = unitMeta.groupBy(unitMeta.partition(), c);

                categories.forEach(function (segment, index) {
                    var sKey = segment.key;
                    var sVal = segment.values;

                    var src = sVal.map(function (item) {
                        var ix = _.isDate(item[x]) ? item[x].getTime() : item[x];
                        var iy = _.isDate(item[y]) ? item[y].getTime() : item[y];
                        return [ix, iy];
                    });

                    var regression = regressionsHub(settings.type, src);
                    var dots = _(regression.points)
                        .chain()
                        .sortBy(function (p) {
                            return p[0];
                        })
                        .filter(function (p) {
                            return ((minY <= p[1]) && (p[1] <= maxY));
                        })
                        .value();

                    if (dots.length > 1) {
                        drawTrendLine(
                            'i-trendline-' + index,
                            dots,
                            options.xScale,
                            options.yScale,
                            options.color.get(sKey),
                            options.container);
                    }
                });

                var handleMouse = function (isActive) {
                    return function () {
                        var g = d3.select(this);
                        g.classed({
                            'active': isActive,
                            'graphical-report__line-width-1': !isActive,
                            'graphical-report__line-width-2': isActive
                        });
                    };
                };

                options.container
                    .selectAll('.graphical-report__trendline')
                    .on('mouseenter', handleMouse(true))
                    .on('mouseleave', handleMouse(false));
            },

            containerTemplate: '<div class="graphical-report__trendlinepanel"></div>',
            template: _.template([
                '<label class="graphical-report__trendlinepanel__title graphical-report__checkbox">',
                '<input type="checkbox" class="graphical-report__checkbox__input i-role-show-trend" <%= showTrend %> />',
                '<span class="graphical-report__checkbox__icon"></span>',
                '<span class="graphical-report__checkbox__text">',
                '<%= title %>',
                '</span>',
                '</label>',

                '<div>',
                '<select class="i-role-change-model graphical-report__select graphical-report__trendlinepanel__control">',
                '<%= models %> />',
                '</select>',
                '</div>',

                '<div class="graphical-report__trendlinepanel__error-message"><%= error %></div>'
            ].join('')),

            onRender: function (chart) {

                if (this._container) {
                    this._container.innerHTML = this.template({
                        title: 'Trend line',
                        error: this.error,
                        showTrend: (settings.showTrend && this._isApplicable) ? 'checked' : '',
                        models: ['linear', 'exponential', 'logarithmic'].map(function (x) {
                            var selected = (settings.type === x) ? 'selected' : '';
                            return '<option ' + selected + ' value="' + x + '">' + x + '</option>';
                        })
                    });
                }
            }
        };
    }

    tauCharts.api.plugins.add('trendline', trendline);

    return trendline;
});