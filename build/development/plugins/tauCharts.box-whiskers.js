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

    var utils = tauCharts.api.utils;

    var MIN = 'minimum';
    var MAX = 'maximum';
    var MEDIAN = 'median';
    var Q1 = 'Q1';
    var Q3 = 'Q3';

    var KEYS = {
        MIN: MIN,
        MAX: MAX,
        MEDIAN: MEDIAN,
        Q1: Q1,
        Q3: Q3
    };

    function percentile(sortedArr, perc) {
        var n = sortedArr.length - 1;
        var pos = perc / 100 * n;
        var posFloor = Math.floor(pos);

        if (posFloor === 0) {
            return {
                pos: 0,
                value: sortedArr[0]
            };
        } else if (posFloor === n) {
            return {
                pos: n,
                value: sortedArr[n]
            };
        } else {
            var module = pos - posFloor;
            if (module) {
                return {
                    pos: pos,
                    value: sortedArr[posFloor] + (module * (sortedArr[posFloor + 1] - sortedArr[posFloor]))
                };
            } else {
                return {
                    pos: pos,
                    value: sortedArr[pos]
                };
            }
        }
    }

    function calculateStatistics(fiber, summary, keys) {

        var values = fiber.sort(function (a, b) {
            return a - b;
        });

        var q1 = percentile(values, 25);
        var median = percentile(values, 50);
        var q3 = percentile(values, 75);

        var iqr = q3.value - q1.value;
        var lowerMildOutlierLimmit = q1.value - 1.5 * iqr;
        var upperMildOutlierLimmit = q3.value + 1.5 * iqr;

        var lowerWhisker = values[0];
        var upperWhisker = values[values.length - 1];

        for (var l = 0; l <= q1.pos; l++) {
            var itemLower = values[l];
            if (itemLower > lowerMildOutlierLimmit) {
                lowerWhisker = itemLower;
                break;
            }
        }

        for (var u = values.length - 1; u >= q3.pos; u--) {
            var itemUpper = values[u];
            if (itemUpper < upperMildOutlierLimmit) {
                upperWhisker = itemUpper;
                break;
            }
        }

        summary[keys.MIN] = lowerWhisker;
        summary[keys.MAX] = upperWhisker;
        summary[keys.MEDIAN] = median.value;
        summary[keys.Q1] = q1.value;
        summary[keys.Q3] = q3.value;

        return summary;
    }

    tauCharts.api.unitsRegistry.reg(
        'ELEMENT.BOX-WHISKERS',
        {
            adjustScales: function (grammarModel) {
                var node = this.node();
                if (node.config.guide.fitScale) {
                    this.fixScale(grammarModel, this.calcStat(grammarModel));
                }
            },

            fixScale: function (grammarModel, stat) {
                var vals = stat
                    .reduce(function (memo, row) {
                        return memo.concat([row[KEYS.MIN], row[KEYS.MAX]]);
                    }, [])
                    .sort(function (a, b) {
                        return a - b;
                    });

                var minY = vals[0];
                var maxY = vals[vals.length - 1];
                grammarModel.scaleY.fixup(function (yScaleConfig) {
                    var newConf = {};

                    if (!yScaleConfig.hasOwnProperty('series')) {
                        newConf.series = [minY, maxY];
                    } else {
                        var min = Math.min(yScaleConfig.series[0], minY);
                        var max = Math.max(yScaleConfig.series[1], maxY);
                        newConf.series = [min, max];
                    }

                    return newConf;
                });
            },

            calcStat: function (grammarModel) {
                var cats = this.node().data().reduce(function (memo, row) {
                    var k = row[grammarModel.scaleX.dim];
                    memo[k] = memo[k] || [];
                    memo[k].push(row[grammarModel.scaleY.dim]);
                    return memo;
                }, {});

                return Object.keys(cats).reduce(function (memo, k) {
                    var base = {};
                    base[grammarModel.scaleX.dim] = k;
                    return memo.concat(calculateStatistics(cats[k], base, KEYS));
                }, []);
            },

            buildRangeModel: function (screenModel, cfg) {
                var flip = screenModel.flip;

                var x = flip ? 'y' : 'x';
                var y = flip ? 'x' : 'y';
                var w = flip ? 'height' : 'width';
                var h = flip ? 'width' : 'height';

                var y0 = flip ? cfg.y1 : cfg.y0;
                var y1 = flip ? cfg.y0 : cfg.y1;
                var size = cfg.size;
                var xs = screenModel.model.scaleX;
                var ys = screenModel.model.scaleY;
                var model = {class: cfg.class};
                model[x] = function (d) {
                    return xs(d[xs.dim]) - size * 0.5;
                };
                model[y] = function (d) {
                    return ys(d[y1]);
                };
                model[w] = function () {
                    return size;
                };
                model[h] = function (d) {
                    return Math.max(cfg.minHeight || 1, Math.abs(ys(d[y0]) - ys(d[y1])));
                };

                return Object.assign(
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
                var summary = this.calcStat(this.node().screenModel.model);
                this.drawElement(container, summary);
            },

            drawElement: function (container, tuples) {

                var self = this;
                var screenModel = this.node().screenModel;

                var createUpdateFunc = tauCharts.api.d3_animationInterceptor;

                var drawPart = function (that, props) {
                    var speed = self.node().config.guide.animationSpeed;
                    var part = that
                        .selectAll('.' + props.class)
                        .data(function(row) {
                            return [row];
                        }, screenModel.id);
                    part.exit()
                        .call(createUpdateFunc(speed, null, {width: 0}, function (node) {
                            d3.select(node).remove();
                        }));
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

        xSettings = utils.defaults((xSettings || {}), {mode: 'outliers-only'});

        return {

            init: function (chart) {
                this._chart = chart;
            },

            onSpecReady: function (chart, specRef) {

                var flip = (xSettings.flip === true);

                specRef.transformations = specRef.transformations || {};

                specRef.transformations.empty = function () {
                    return [];
                };

                specRef.transformations.outliers = function (data, props) {

                    var x = props.x.dim;
                    var y = props.y.dim;

                    var groups = data.reduce(function (memo, row) {
                        var k = row[x];
                        memo[k] = memo[k] || [];
                        memo[k].push(row[y]);
                        return memo;
                    }, {});

                    var filters = Object.keys(groups).reduce(function (filters, k) {

                        var stat = calculateStatistics(groups[k], {}, KEYS);
                        var max = stat[KEYS.MAX];
                        var min = stat[KEYS.MIN];

                        return filters.concat(function (row) {
                            if (row[x] === k) {
                                return (row[y] > max) || (row[y] < min);
                            }
                            return true;
                        });
                    }, []);

                    return data.filter(function (row) {
                        var deny = filters.some(function (f) {
                            return !f(row);
                        });

                        return !deny;
                    });
                };

                chart.traverseSpec(
                    specRef,
                    function (unit, parentUnit) {

                        if (unit.type !== 'ELEMENT.POINT') {
                            return;
                        }

                        var boxWhiskers = JSON.parse(JSON.stringify(unit));
                        boxWhiskers.type = 'ELEMENT.BOX-WHISKERS';
                        boxWhiskers.flip = flip;
                        boxWhiskers.namespace = 'boxwhiskers';
                        boxWhiskers.guide = boxWhiskers.guide || {};
                        boxWhiskers.guide.fitScale = (xSettings.mode === 'hide-scatter');

                        var strategies = {
                            'show-scatter': [],
                            'hide-scatter': [
                                {type: 'empty'}
                            ],
                            'outliers-only': [{
                                type: 'outliers',
                                args: {
                                    x: specRef.scales[flip ? unit.y : unit.x],
                                    y: specRef.scales[flip ? unit.x : unit.y]
                                }
                            }]
                        };

                        unit.transformation = unit.transformation || [];
                        unit.transformation = unit.transformation.concat(strategies[xSettings.mode]);

                        parentUnit.units.push(boxWhiskers);
                    });
            }
        };
    }

    tauCharts.api.plugins.add('box-whiskers', boxWhiskersPlot);

    return boxWhiskersPlot;
});
