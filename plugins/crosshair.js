(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['taucharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('taucharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var d3 = tauCharts.api.d3;
    var utils = tauCharts.api.utils;
    var pluginsSDK = tauCharts.api.pluginsSDK;

    function Crosshair(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                xAxis: true,
                yAxis: true,
                formatters: {},
                labelXPadding: 8,
                labelYPadding: 8
            });

        var plugin = {

            init: function (chart) {

                this._chart = chart;
                this._formatters = {};

                this._element = this._createNode();

            },

            _createNode: function () {
                var node = d3.select(
                    document.createElementNS(d3.ns.prefix.svg, 'g'))
                    .attr('class', 'tau-crosshair');
                var createAxisNode = function (dir) {
                    var g = node.append('g').attr('class', 'tau-crosshair__group ' + dir);
                    g.append('line').attr('class', 'tau-crosshair__line-bg');
                    g.append('line').attr('class', 'tau-crosshair__line');
                    g.append('text').attr('class', 'tau-crosshair__label-bg');
                    g.append('text').attr('class', 'tau-crosshair__label');
                };
                if (settings.xAxis) {
                    createAxisNode('x');
                }
                if (settings.yAxis) {
                    createAxisNode('y');
                }
                return node;
            },

            _setValues: function (xData, yData, colorData) {

                var setCrosshairGroupValues = function (data) {

                    var g = this._element.select('.tau-crosshair__group.' + data.dir);

                    g.select('.tau-crosshair__line')
                        .attr('class', 'tau-crosshair__line ' + colorData.cls)
                        .attr('stroke', colorData.color);
                    g.selectAll('.tau-crosshair__line, .tau-crosshair__line-bg')
                        .attr('x1', data.lineX1)
                        .attr('x2', data.lineX2)
                        .attr('y1', data.lineY1)
                        .attr('y2', data.lineY2);

                    g.select('.tau-crosshair__label')
                        .attr('class', 'tau-crosshair__label ' + colorData.cls)
                        .attr('fill', colorData.color);
                    g.selectAll('.tau-crosshair__label, .tau-crosshair__label-bg')
                        .attr('x', data.textX + settings.labelXPadding)
                        .attr('y', data.textY - settings.labelYPadding)
                        .text(data.label);

                }.bind(this);

                setCrosshairGroupValues({
                    dir: 'x',
                    lineX1: xData.value,
                    lineX2: xData.value,
                    lineY1: yData.value + yData.crossPadding,
                    lineY2: yData.start,
                    label: xData.label,
                    textX: xData.value,
                    textY: yData.start
                });

                setCrosshairGroupValues({
                    dir: 'y',
                    lineX1: xData.start,
                    lineX2: xData.value + xData.crossPadding,
                    lineY1: yData.value,
                    lineY2: yData.value,
                    label: yData.label,
                    textX: xData.start,
                    textY: yData.value
                });
            },

            _showCrosshair: function (unit, e) {
                var node = unit.config.options.container.node();
                node.parentNode.appendChild(this._element.node());

                var scaleX = unit.getScale('x');
                var scaleY = unit.getScale('y');
                var scaleColor = unit.getScale('color');
                var color = scaleColor(e.data[scaleColor.dim]);
                var xValue = e.data[scaleX.dim];
                var yValue = e.data[scaleY.dim];
                if (unit.config.stack) {
                    if (unit.config.flip) {
                        xValue = unit.data()
                            .filter(function (d) {
                                var dy = d[scaleY.dim];
                                return (
                                    ((dy === yValue) || (dy - yValue === 0)) &&
                                    (unit.screenModel.x(d) <= unit.screenModel.x(e.data)) &&
                                    (xValue * d[scaleX.dim] > 0)
                                );
                            }).reduce(function (total, d) {
                                return (total + d[scaleX.dim]);
                            }, 0);
                    } else {
                        yValue = unit.data()
                            .filter(function (d) {
                                var dx = d[scaleX.dim];
                                return (
                                    ((dx === xValue) || (dx - xValue === 0)) &&
                                    (unit.screenModel.y(d) >= unit.screenModel.y(e.data)) &&
                                    (yValue * d[scaleY.dim] > 0)
                                );
                            }).reduce(function (total, d) {
                                return (total + d[scaleY.dim]);
                            }, 0);
                    }
                }

                var box = e.node.getBBox();
                var pad = (function getCrossPadding() {
                    if (unit.config.type === 'ELEMENT.INTERVAL' ||
                        unit.config.type === 'ELEMENT.INTERVAL.STACKED') {
                        return {
                            x: (-box.width * (unit.config.flip ? xValue > 0 ? 1 : 0 : 0.5)),
                            y: (box.height * (unit.config.flip ? 0.5 : yValue > 0 ? 1 : 0))
                        };
                    }
                    return {
                        x: (-box.width / 2),
                        y: (box.height / 2)
                    };
                })();

                this._setValues(
                    {
                        label: this._getFormat(scaleX.dim)(xValue),
                        start: 0,
                        value: scaleX(xValue),
                        crossPadding: pad.x
                    },
                    {
                        label: this._getFormat(scaleY.dim)(yValue),
                        start: unit.config.options.height,
                        value: scaleY(yValue),
                        crossPadding: pad.y
                    },
                    {
                        cls: (scaleColor.toColor(color) ? '' : color),
                        color: (scaleColor.toColor(color) ? color : '')
                    }
                );
            },

            _hideCrosshair: function () {
                var el = this._element.node();
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            },

            destroy: function () {
                this._hideCrosshair();
            },

            _subscribeToHover: function () {

                var elementsToMatch = [
                    'ELEMENT.LINE',
                    'ELEMENT.AREA',
                    'ELEMENT.PATH',
                    'ELEMENT.INTERVAL',
                    'ELEMENT.INTERVAL.STACKED',
                    'ELEMENT.POINT'
                ];

                this._chart
                    .select(function (node) {
                        return (elementsToMatch.indexOf(node.config.type) >= 0);
                    })
                    .forEach(function (node) {

                        node.on('data-hover', function (unit, e) {
                            if (!e.data) {
                                this._hideCrosshair();
                                return;
                            }
                            if (unit.data().indexOf(e.data) >= 0) {
                                this._showCrosshair(unit, e);
                            }
                        }.bind(this));
                    }, this);
            },

            _getFormat: function (k) {
                var info = this._formatters[k] || {
                    format: function (x) {
                        return String(x);
                    }
                };
                return info.format;
            },

            onRender: function () {

                this._formatters = this._getFormatters();
                this._subscribeToHover();
            },

            _getFormatters: function () {

                var info = pluginsSDK.extractFieldsFormatInfo(this._chart.getSpec());
                Object.keys(info).forEach(function (k) {
                    if (info[k].parentField) {
                        delete info[k];
                    }
                });

                var toLabelValuePair = function (x) {

                    var res = {};

                    if (typeof x === 'function' || typeof x === 'string') {
                        res = {format: x};
                    } else if (utils.isObject(x)) {
                        res = utils.pick(x, 'label', 'format', 'nullAlias');
                    }

                    return res;
                };

                Object.keys(settings.formatters).forEach(function (k) {

                    var fmt = toLabelValuePair(settings.formatters[k]);

                    info[k] = Object.assign(
                        ({label: k, nullAlias: ('No ' + k)}),
                        (info[k] || {}),
                        (utils.pick(fmt, 'label', 'nullAlias')));

                    if (fmt.hasOwnProperty('format')) {
                        info[k].format = (typeof fmt.format === 'function') ?
                            (fmt.format) :
                            (tauCharts.api.tickFormat.get(fmt.format, info[k].nullAlias));
                    } else {
                        info[k].format = (info[k].hasOwnProperty('format')) ?
                            (info[k].format) :
                            (tauCharts.api.tickFormat.get(null, info[k].nullAlias));
                    }
                });

                return info;
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('crosshair', Crosshair);

    return Crosshair;
});