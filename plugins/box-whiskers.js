(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var MIN = 'minimum';
    var MAX = 'maximum';
    var MEDIAN = 'median';
    var Q1 = 'Q1';
    var Q3 = 'Q3';

    var percentile = function (sortedArr, n) {
        var len = sortedArr.length - 1;
        var pos = Math.round(len * n);
        return sortedArr[pos];
    };

    tauCharts.api.unitsRegistry.reg(
        'ELEMENT.BOX-WHISKERS',
        {
            buildRangeModel: function (screenModel, cfg) {
                var size = cfg.size;
                var y0 = cfg.y0;
                var y1 = cfg.y1;
                var xs = screenModel.model.scaleX;
                var ys = screenModel.model.scaleY;
                var model = {
                    x: (d)  => xs(d[xs.dim]) - size * 0.5,
                    y: (d) => ys(d[y1]),
                    width: () => size,
                    height: (d) => Math.max(cfg.minHeight || 1, Math.abs(ys(d[y0]) - ys(d[y1]))),
                    class: cfg.class
                };

                return _.extend(
                    model,
                    {
                        fill: () => cfg.color || 'rgba(0,0,256, 0.5)'
                    });
            },

            draw: function () {

                var cfg = this.node().config;

                var container = cfg.options.slot(cfg.uid);

                var screenModel = this.node().screenModel;
                var model = screenModel.model;

                var cats = this.node().data().reduce((memo, row) => {
                    var k = row[model.scaleX.dim];
                    memo[k] = memo[k] || [];
                    memo[k].push(row[model.scaleY.dim]);
                    return memo;
                }, {});

                var tuples = Object.keys(cats).reduce((memo, k) => {
                    var values = cats[k].sort((a, b) => a - b);
                    var summary = {};
                    summary[model.scaleX.dim] = k;

                    var n = values.length;
                    var q1Pos = n * 0.25;
                    q1Pos = Math.floor(q1Pos);
                    var q1 = (q1Pos % 1 ? (values[q1Pos] + values[q1Pos + 1]) / 2 : values[q1Pos]);

                    var medianPos = n * 0.5;
                    medianPos = Math.floor(medianPos);
                    var median = (medianPos % 1 ? (values[medianPos] + values[medianPos + 1]) / 2 : values[medianPos]);

                    var q3Pos = n * 0.75;
                    q3Pos = Math.floor(q3Pos);
                    var q3 = (q3Pos % 1 ? (values[q3Pos] + values[q3Pos + 1]) / 2 : values[q3Pos]);

                    var iqr = q3 - q1;
                    var lowerMildOutlierLimmit = q1 - 1.5 * iqr;
                    var upperMildOutlierLimmit = q3 + 1.5 * iqr;

                    var lowerWhisker = values[0];
                    var upperWhisker = values[n - 1];

                    for (var i = 0; i < q1Pos; i++) {
                        var item = values[i];
                        if (item > lowerMildOutlierLimmit) {
                            lowerWhisker = item;
                            break;
                        }
                    }
                    for (var i = n - 1; i > q3Pos; i--) {
                        var item = values[i];
                        if (item < upperMildOutlierLimmit) {
                            upperWhisker = item;
                            break;
                        }
                    }

                    summary[MIN] = lowerWhisker;
                    summary[MAX] = upperWhisker;
                    summary[MEDIAN] = median;
                    summary[Q1] = q1;
                    summary[Q3] = q3;

                    return memo.concat(summary);
                }, []);

                this.drawElement(container, tuples);
            },

            drawElement: function (container, tuples) {

                var self = this;
                var screenModel = this.node().screenModel;

                var createUpdateFunc = tauCharts.api.d3_animationInterceptor;

                var drawPart = function (that, props) {
                    var speed = self.node().config.guide.animationSpeed;
                    var part = that
                        .selectAll('.' + props.class)
                        .data((row) => [row], screenModel.id);
                    part.exit()
                        .call(createUpdateFunc(speed, null, {width: 0}, (node) => d3.select(node).remove()));
                    part.call(createUpdateFunc(speed, null, props));
                    part.enter()
                        .append('rect')
                        .style('stroke-width', 0)
                        .call(createUpdateFunc(speed, {width: 0}, props));
                };

                var drawElement = function () {

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 2,
                        y0: MIN,
                        y1: Q1,
                        class: 'range-min-Q1'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 2,
                        y0: Q3,
                        y1: MAX,
                        class: 'range-Q3-max'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        y0: Q1,
                        y1: Q3,
                        class: 'range-Q1-Q3'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 1,
                        y0: MAX,
                        y1: MAX,
                        class: 'limit-max'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 1,
                        y0: MIN,
                        y1: MIN,
                        class: 'limit-min'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 2,
                        y0: MEDIAN,
                        y1: MEDIAN,
                        color: '#ff0000',
                        class: 'limit-median'
                    }));
                };

                var frameGroups = container
                    .selectAll('.box-whiskers-node')
                    .data(tuples);
                frameGroups
                    .exit()
                    .remove();
                frameGroups
                    .call(drawElement);
                frameGroups
                    .enter()
                    .append('g')
                    .attr('class', 'box-whiskers-node')
                    .call(drawElement);
            }
        },
        'ELEMENT.GENERIC.CARTESIAN');

    function boxWhiskersPlot(xSettings) {

        return {

            init: function (chart) {
                this._chart = chart;
            },

            onSpecReady: (chart, specRef) => {

                specRef.transformations = specRef.transformations || {};
                specRef.transformations.empty = () => [];

                chart.traverseSpec(
                    specRef,
                    (unit, parentUnit) => {

                        if (unit.type !== 'ELEMENT.POINT') {
                            return;
                        }

                        var boxWhiskers = JSON.parse(JSON.stringify(unit));
                        boxWhiskers.type = 'ELEMENT.BOX-WHISKERS';
                        boxWhiskers.namespace = 'boxwhiskers';

                        unit.transformation = unit.transformation || [];
                        if (xSettings.hideScatterplot) {
                            unit.transformation.push({
                                type: 'empty'
                            });
                        }

                        parentUnit.units.push(boxWhiskers);
                    });
            }
        };
    }

    tauCharts.api.plugins.add('box-whiskers', boxWhiskersPlot);

    return boxWhiskersPlot;
});
