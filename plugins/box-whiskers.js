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
                    x: function (d) {
                        return xs(d[xs.dim]) - size * 0.5;
                    },
                    y: function (d) {
                        return ys(d[y1]);
                    },
                    width: function () {
                        return size;
                    },
                    height: function (d) {
                        return Math.max(cfg.minHeight || 1, Math.abs(ys(d[y0]) - ys(d[y1])));
                    },
                    class: cfg.class
                };

                return _.extend(
                    model,
                    {
                        fill: function () {
                            return cfg.color || 'rgba(0,0,256, 0.5)';
                        }
                    });
            },

            draw: function () {

                var cfg = this.node().config;

                var container = cfg.options.slot(cfg.uid);

                var screenModel = this.node().screenModel;
                var model = screenModel.model;

                var cats = this.node().data().reduce(function (memo, row) {
                    var k = row[model.scaleX.dim];
                    memo[k] = memo[k] || [];
                    memo[k].push(row[model.scaleY.dim]);
                    return memo;
                }, {});

                var MIN = 'minimum';
                var MAX = 'maximum';
                var AVG = 'mean';
                var Q1 = 'Q1';
                var Q3 = 'Q3';

                var tuples = Object.keys(cats).reduce(function (memo, k) {
                    var values = cats[k].sort(function (a, b) {
                        return a - b;
                    });
                    var summary = {};
                    summary[model.scaleX.dim] = k;
                    var sum = values.reduce(function (sum, x) {
                        return sum + x;
                    }, 0);
                    var average = sum / values.length;
                    var p25 = percentile(values, 0.25);
                    var p75 = percentile(values, 0.75);
                    var iqr = p75 - p25;

                    summary[MIN] = (p25 - (iqr * 1.5)); // Math.min.apply(null, values));
                    summary[MAX] = (p75 + (iqr * 1.5)); // Math.max.apply(null, values));
                    summary[AVG] = average;
                    summary[Q1] = p25;
                    summary[Q3] = p75;

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
                        y0: 'minimum',
                        y1: 'Q1',
                        class: 'range-min-Q1'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 2,
                        y0: 'Q3',
                        y1: 'maximum',
                        class: 'range-Q3-max'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        y0: 'Q1',
                        y1: 'Q3',
                        class: 'range-Q1-Q3'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 1,
                        y0: 'maximum',
                        y1: 'maximum',
                        class: 'limit-max'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 1,
                        y0: 'minimum',
                        y1: 'minimum',
                        class: 'limit-min'
                    }));

                    drawPart(this, self.buildRangeModel(screenModel, {
                        size: 20,
                        minHeight: 2,
                        y0: 'mean',
                        y1: 'mean',
                        color: '#ff0000',
                        class: 'limit-avg'
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

            onSpecReady: function (chart, specRef) {

                specRef.transformations = specRef.transformations || {};
                specRef.transformations.empty = function () {
                    return [];
                };

                chart.traverseSpec(
                    specRef,
                    function (unit, parentUnit) {

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
