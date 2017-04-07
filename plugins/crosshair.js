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
                    g.append('line').attr('class', 'tau-crosshair__line');
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

                var gx = this._element.select('.tau-crosshair__group.x');
                gx.select('.tau-crosshair__line')
                    .attr('class', 'tau-crosshair__line ' + colorData.cls)
                    .attr('stroke', colorData.color)
                    .attr('x1', xData.value)
                    .attr('x2', xData.value)
                    .attr('y1', yData.value)
                    .attr('y2', yData.start);
                gx.select('.tau-crosshair__label')
                    .attr('class', 'tau-crosshair__label ' + colorData.cls)
                    .attr('fill', colorData.color)
                    .attr('x', xData.value + settings.labelXPadding)
                    .attr('y', yData.start - settings.labelYPadding)
                    .text(xData.label);

                var gy = this._element.select('.tau-crosshair__group.y');
                gy.select('.tau-crosshair__line')
                    .attr('class', 'tau-crosshair__line ' + colorData.cls)
                    .attr('stroke', colorData.color)
                    .attr('x1', xData.start)
                    .attr('x2', xData.value)
                    .attr('y1', yData.value)
                    .attr('y2', yData.value);
                gy.select('.tau-crosshair__label')
                    .attr('class', 'tau-crosshair__label ' + colorData.cls)
                    .attr('fill', colorData.color)
                    .attr('x', xData.start + settings.labelXPadding)
                    .attr('y', yData.value - settings.labelYPadding)
                    .text(yData.label);
            },

            _showCrosshair: function (unit, e) {
                var node = unit.config.options.container.node();
                node.insertBefore(this._element.node(), node.firstChild);

                var scaleX = unit.getScale('x');
                var scaleY = unit.getScale('y');
                var scaleColor = unit.getScale('color');
                var color = scaleColor(e.data[scaleColor.dim]);
                this._setValues(
                    {
                        label: this._getFormat(scaleX.dim)(e.data[scaleX.dim]),
                        start: scaleX(scaleX.domain()[0]),
                        value: scaleX(e.data[scaleX.dim])
                    },
                    {
                        label: this._getFormat(scaleY.dim)(e.data[scaleY.dim]),
                        start: scaleY(scaleY.domain()[0]),
                        value: scaleY(e.data[scaleY.dim])
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
                            this._showCrosshair(unit, e);
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