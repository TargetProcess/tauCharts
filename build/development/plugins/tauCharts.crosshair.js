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
    var svgUtils = tauCharts.api.svgUtils;
    var pluginsSDK = tauCharts.api.pluginsSDK;

    function labelBox(options) {

        options = (options || {});

        var node = document.createElementNS(d3.ns.prefix.svg, 'g');

        var g = d3.select(node).attr('class', 'tau-crosshair__label');
        g.append('rect').attr('class', 'tau-crosshair__label__box');
        g.append('text').attr('class', 'tau-crosshair__label__text-shadow');
        g.append('text').attr('class', 'tau-crosshair__label__text');

        var setValues = function (args) {

            var x = args.x;
            var y = args.y;
            var text = args.text;
            var color = args.color;
            var colorCls = args.colorCls;

            g.attr('class', 'tau-crosshair__label ' + colorCls);

            var halign = options.halign;
            var valign = options.valign;
            var hpad = options.hpad;
            var vpad = options.vpad;

            var textAnchor = ({
                left: 'end',
                middle: 'middle',
                right: 'start'
            }[halign]);
            var textDx = ({
                left: -hpad,
                middle: 0,
                right: hpad
            }[halign]);

            var t = g.select('.tau-crosshair__label__text')
                .attr('fill', color);
            var tAndBg = g.selectAll('.tau-crosshair__label__text, .tau-crosshair__label__text-shadow')
                .attr('text-anchor', textAnchor)
                .attr('x', x + textDx)
                .attr('y', 0)
                .text(text);
            var textBBox = t.node().getBBox();
            var textDy = ({
                top: -vpad - textBBox.height / 2,
                middle: 0,
                bottom: vpad + textBBox.height / 2
            }[valign] - textBBox.height / 2 - textBBox.y);
            tAndBg
                .attr('y', y + textDy);

            var boxWidth = (textBBox.width + 2 * hpad);
            var boxHeight = (textBBox.height + 2 * vpad);
            var boxDx = ({
                left: -boxWidth,
                middle: -boxWidth / 2,
                right: 0
            }[halign]);
            var boxDy = ({
                top: -boxHeight,
                middle: -boxHeight / 2,
                bottom: 0
            }[valign]);

            g.select('.tau-crosshair__label__box')
                .attr('fill', color)
                .attr('rx', options.boxCornerRadius)
                .attr('ry', options.boxCornerRadius)
                .attr('x', x + boxDx)
                .attr('y', y + boxDy)
                .attr('width', boxWidth)
                .attr('height', boxHeight);
        };

        var fixOverflow = function () {
            g.attr('transform', '');
            var view = options.chart.getLayout().contentContainer.getBoundingClientRect();
            var svg = options.chart.getSVG().getBoundingClientRect();
            var label = node.getBoundingClientRect();

            var dx = (
                Math.max(0, Math.max(view.left, svg.left) - label.left) ||
                Math.min(0, Math.min(view.right, svg.right) - label.right)
            );
            var dy = (
                Math.max(0, Math.max(view.top, svg.top) - label.top) ||
                Math.min(0, Math.min(view.bottom, svg.bottom) - label.bottom)
            );
            g.attr('transform', 'translate(' + dx + ',' + dy + ')');
        };

        var instance = {

            options: function (obj) {
                options = Object.assign(options, obj);
                return instance;
            },

            show: function (args) {
                options.container.appendChild(node);
                setValues(args);
                fixOverflow();
                return instance;
            },

            hide: function () {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                return instance;
            }
        };

        return instance;
    }

    function Crosshair(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                xAxis: true,
                yAxis: true,
                formatters: {},
                labelBoxHPadding: 5,
                labelBoxVPadding: 3,
                labelBoxCornerRadius: 3,
                axisHPadding: 22,
                axisVPadding: 22
            });

        var plugin = {

            init: function (chart) {

                this._chart = chart;
                this._formatters = {};

                this._createNode();

            },

            _createNode: function () {

                var root = d3.select(
                    document.createElementNS(d3.ns.prefix.svg, 'g'))
                    .attr('class', 'tau-crosshair');
                this._labels = {x: null, y: null};
                var createAxisNode = function (dir) {
                    var g = root.append('g').attr('class', 'tau-crosshair__group ' + dir);
                    g.append('line').attr('class', 'tau-crosshair__line-shadow');
                    g.append('line').attr('class', 'tau-crosshair__line');

                    this._labels[dir] = labelBox({
                        container: g.node(),
                        chart: this._chart,
                        halign: dir === 'x' ? 'middle' : 'left',
                        valign: dir === 'x' ? 'bottom' : 'middle',
                        boxCornerRadius: settings.labelBoxCornerRadius,
                        hpad: settings.labelBoxHPadding,
                        vpad: settings.labelBoxVPadding
                    });
                }.bind(this);

                if (settings.xAxis) {
                    createAxisNode('x');
                }
                if (settings.yAxis) {
                    createAxisNode('y');
                }

                this._element = root;
            },

            _setValues: function (xData, yData, colorData) {

                var setCrosshairGroupValues = function (data) {

                    var g = this._element.select('.tau-crosshair__group.' + data.dir);

                    g.select('.tau-crosshair__line')
                        .attr('class', 'tau-crosshair__line ' + colorData.cls)
                        .attr('stroke', colorData.color);
                    g.selectAll('.tau-crosshair__line, .tau-crosshair__line-shadow')
                        .attr('x1', data.startPt.x)
                        .attr('x2', data.valuePt.x)
                        .attr('y1', data.startPt.y)
                        .attr('y2', data.valuePt.y);

                    if (
                        (data.dir === 'x' && settings.xAxis) ||
                        (data.dir === 'y' && settings.yAxis)
                    ) {
                        this._labels[data.dir]
                            .options({
                                halign: data.labelHAlign,
                                valign: data.labelVAlign
                            })
                            .show({
                                x: data.startPt.x,
                                y: data.startPt.y,
                                text: data.label,
                                color: colorData.color,
                                colorCls: colorData.cls
                            });
                    }

                }.bind(this);

                setCrosshairGroupValues({
                    dir: 'x',
                    startPt: {
                        x: xData.value,
                        y: yData.start + (xData.minMode ? 0 : settings.axisVPadding)
                    },
                    valuePt: {
                        x: xData.value,
                        y: yData.value + yData.crossPadding
                    },
                    label: xData.label,
                    labelHAlign: 'middle',
                    labelVAlign: 'bottom'
                });

                setCrosshairGroupValues({
                    dir: 'y',
                    startPt: {
                        x: xData.start - (yData.minMode ? 0 : settings.axisHPadding),
                        y: yData.value
                    },
                    valuePt: {
                        x: xData.value - xData.crossPadding,
                        y: yData.value
                    },
                    label: yData.label,
                    labelHAlign: 'left',
                    labelVAlign: 'middle'
                });
            },

            _showCrosshair: function (e, unit, parentUnit) {
                var svg = this._chart.getSVG();
                var target = unit.config.options.container.node();
                var translate = svgUtils.getDeepTransformTranslate(target);
                this._element.attr('transform', svgUtils.translate(translate.x, translate.y));
                svg.appendChild(this._element.node());

                var scaleX = unit.getScale('x');
                var scaleY = unit.getScale('y');
                var scaleColor = unit.getScale('color');
                var color = scaleColor(e.data[scaleColor.dim]);
                var xValue = e.data[scaleX.dim];
                var yValue = e.data[scaleY.dim];
                var ex = unit.screenModel.x(e.data);
                var ey = unit.screenModel.y(e.data);
                if (unit.config.stack) {
                    if (unit.config.flip) {
                        var xSameSign = unit.data().filter(function (d) {
                            var dy = d[scaleY.dim];
                            return (
                                (d === e.data) ||
                                ((dy === yValue) || (dy - yValue === 0)) &&
                                ((unit.screenModel.x(e.data) - unit.screenModel.x(d)) * d[scaleX.dim] > 0)
                            );
                        });
                        ex = (xValue < 0 ? Math.min : Math.max).apply(null, xSameSign.map(function (d) {
                            return unit.screenModel.x(d);
                        }, 0));
                        xValue = xSameSign.reduce(function (total, d) {
                            return (total + d[scaleX.dim]);
                        }, 0);
                    } else {
                        var ySameSign = unit.data().filter(function (d) {
                            var dx = d[scaleX.dim];
                            return (
                                (d === e.data) ||
                                ((dx === xValue) || (dx - xValue === 0)) &&
                                ((unit.screenModel.y(d) - unit.screenModel.y(e.data)) * d[scaleY.dim] > 0)
                            );
                        });
                        ey = (yValue < 0 ? Math.max : Math.min).apply(null, ySameSign.map(function (d) {
                            return unit.screenModel.y(d);
                        }, 0));
                        yValue = ySameSign.reduce(function (total, d) {
                            return (total + d[scaleY.dim]);
                        }, 0);
                    }
                }

                var box = e.node.getBBox();
                var pad = (function getCrossPadding() {
                    if (unit.config.type === 'ELEMENT.INTERVAL' ||
                        unit.config.type === 'ELEMENT.INTERVAL.STACKED') {
                        return {
                            x: (box.width * (unit.config.flip ? xValue > 0 ? 1 : 0 : 0.5)),
                            y: (box.height * (unit.config.flip ? 0.5 : yValue > 0 ? 1 : 0))
                        };
                    }
                    return {
                        x: (box.width / 2),
                        y: (box.height / 2)
                    };
                })();

                this._setValues(
                    {
                        label: this._getFormat(scaleX.dim)(xValue),
                        start: 0,
                        value: ex,
                        crossPadding: pad.x,
                        minMode: (parentUnit && parentUnit.guide.x.hide)
                    },
                    {
                        label: this._getFormat(scaleY.dim)(yValue),
                        start: unit.config.options.height,
                        value: ey,
                        crossPadding: pad.y,
                        minMode: (parentUnit && parentUnit.guide.y.hide)
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
                                var parentUnit = pluginsSDK.getParentUnit(this._chart.getSpec(), unit.config);
                                this._showCrosshair(e, unit, parentUnit);
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