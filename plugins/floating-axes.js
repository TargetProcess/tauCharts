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

    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;

    function floatingAxes(xSettings) {

        var settings = _.defaults(xSettings || {}, {
            bgcolor: '#fff'
        });

        var scrollBarWidth = tauCharts.api.globalSettings.getScrollBarWidth();

        var mmin = function (arr) {
            return Math.min.apply(null, arr);
        };

        var mmax = function (arr) {
            return Math.max.apply(null, arr);
        };

        var translate = function (x, y) {
            return ('translate(' + (x) + ',' + (y) + ')');
        };

        var extractAxesInfo = function (selection) {
            var transProp = 'transform';
            var axes = [];
            var xs = [];
            var ys = [];
            selection.each(function () {
                var parent = this;
                var axisNode = this.cloneNode(true);
                var x = 0;
                var y = 0;
                while (parent.nodeName.toUpperCase() !== 'SVG') {
                    var transform = (parent.attributes[transProp] || {}).value || '';
                    if (transform.indexOf('translate(') === 0) {
                        var xy = transform
                            .replace('translate(', '')
                            .replace(')', '')
                            .replace(' ', ',')
                            .split(',')
                            .concat(0)
                            .map(function (x) {
                                return (x - 0) || 0;
                            });
                        x += (xy[0] - 0);
                        y += (xy[1] - 0);
                    }
                    parent = parent.parentNode;
                }
                xs.push(x);
                ys.push(y);
                axes.push(axisNode);
            });

            return {
                xs: xs,
                ys: ys,
                axes: axes
            };
        };

        var createSlot = function (d3Svg) {
            return d3Svg.append('g');
        };

        var addBackground = function (g, w, h, color) {
            g.append('rect')
                .attr({
                    x: 0,
                    y: 0,
                    width: w,
                    height: h,
                    fill: color
                });
            return g;
        };

        var addAxes = function (g, axes) {
            axes.reduce(
                function (dstSvg, node) {
                    dstSvg.appendChild(node);
                    return dstSvg;
                },
                g.node());
            return g;
        };

        var extractXAxesNew = function (scrollableArea, srcSvg, xSel) {
            var height = srcSvg.attr('height');
            var width = srcSvg.attr('width');
            var info = extractAxesInfo(xSel);
            var axes = info.axes;
            var xs = info.xs;
            var ys = info.ys;

            var minY = mmin(ys);

            var axisHeight = height - minY + 1 + scrollBarWidth;

            axes.forEach(function (axisNode, i) {
                d3
                    .select(axisNode)
                    .attr('transform', translate(xs[i], (ys[i] - minY)));
            });

            var g = addAxes(addBackground(createSlot(srcSvg), width, axisHeight, settings.bgcolor), axes);

            var move = function (x, bottomY) {
                var y = Math.min((bottomY - axisHeight), (minY - 1));
                g.attr('transform', translate(x, y));
            };

            var scrollableHeight = (scrollableArea.getBoundingClientRect().height);
            move(0, scrollableHeight);

            return {
                element: g,
                handler: function () {
                    var scrollY = (scrollableHeight + scrollableArea.scrollTop);
                    move(0, scrollY);
                }
            };
        };

        var extractYAxesNew = function (scrollableArea, srcSvg, ySel) {
            var width = srcSvg.attr('width');
            var height = srcSvg.attr('height');
            var info = extractAxesInfo(ySel);
            var axes = info.axes;
            var xs = info.xs;
            var ys = info.ys;

            axes.forEach(function (axisNode, i) {
                d3
                    .select(axisNode)
                    .attr('transform', translate(xs[i], ys[i]));
            });

            var axisWidth = mmax(xs);

            var g = addAxes(addBackground(createSlot(srcSvg), axisWidth, height, settings.bgcolor), axes);

            var move = function (topX, y) {
                var x = Math.max((topX), 0);
                g.attr('transform', translate(x, y));
            };

            move(0, 0);
            return {
                element: g,
                handler: function () {
                    var scrollX = (scrollableArea.scrollLeft);
                    move(scrollX, 0);
                }
            };
        };

        var extractCenter = function (scrollableArea, srcSvg, xSel, ySel) {
            var width = srcSvg.attr('width');
            var height = srcSvg.attr('height');
            var w = mmax(extractAxesInfo(ySel).xs) + 1;
            var y = mmin(extractAxesInfo(xSel).ys);
            var h = height - y + 1 + scrollBarWidth;
            var x = 0;

            var g = addBackground(createSlot(srcSvg), w, h, settings.bgcolor);

            var move = function (topX, bottomY) {
                var xi = Math.max((topX), 0);
                var yi = Math.min((bottomY - h), (y - 1));
                g.attr('transform', translate(xi, yi));
            };

            var scrollableHeight = (scrollableArea.getBoundingClientRect().height);
            move(x, scrollableHeight);
            return {
                element: g,
                handler: function () {
                    var scrollX = (scrollableArea.scrollLeft);
                    var scrollY = (scrollableHeight + scrollableArea.scrollTop);
                    move(scrollX, scrollY);
                }
            };
        };

        return {

            init: function (chart) {
                this._chart = chart;
                this.rootNode = chart.getLayout().content.parentNode;
                this.handlers = [];
            },

            recycle: function () {
                var root = this.rootNode;
                this.handlers.forEach(function (item) {
                    root.removeEventListener('scroll', item.handler);
                    item.element.remove();
                });
            },

            destroy: function () {
                this.recycle();
            },

            onRender: function (chart) {

                this.recycle();

                var applicable = true;
                chart.traverseSpec(chart.getSpec(), function (unit) {
                    var isCoordNode = (unit && (unit.type.indexOf('COORDS.') === 0));
                    if (isCoordNode) {
                        if (unit.type !== 'COORDS.RECT') {
                            // non-rectangular coordinates
                            applicable = false;
                        } else {
                            var guide = unit.guide || {};
                            if (guide.autoLayout !== 'extract-axes') {
                                // non-extract axes
                                applicable = false;
                            }
                        }
                    }
                });

                if (applicable) {
                    var root = this.rootNode;
                    var srcSvg = d3.select(chart.getSVG());
                    var xSel = srcSvg.selectAll('.x.axis');
                    var ySel = srcSvg.selectAll('.y.axis');
                    this.handlers = [
                        extractXAxesNew(root, srcSvg, xSel),
                        extractYAxesNew(root, srcSvg, ySel),
                        extractCenter(root, srcSvg, xSel, ySel)
                    ];

                    this.handlers.forEach(function (item) {
                        root.addEventListener('scroll', item.handler, false);
                    });
                }
            }
        };
    }

    tauCharts.api.plugins.add('floating-axes', floatingAxes);

    return floatingAxes;
});