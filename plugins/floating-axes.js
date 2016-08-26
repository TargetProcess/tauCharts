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

        var shadowStdDev = 2;

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
            var slot = d3Svg.append('g');
            slot.attr('class', 'floating-axes');
            return slot;
        };

        var addBackground = function (cont, w, h, color, hideShadow) {

            var shadow = hideShadow ? {} : {filter: 'url(#drop-shadow)'};

            var bs = 2;
            var dx = (bs + 1);
            var dy = (-bs);
            cont.append('rect')
                .attr({
                    class: 'i-role-bg',
                    x: 0,
                    y: dy,
                    width: w + dx,
                    height: h + bs,
                    fill: color
                })
                .style(shadow);

            return cont;
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

        var extractXAxesNew = function (scrollableArea, scrollBarWidth, srcSvg, xSel) {
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
            var rect = g.select('.i-role-bg');

            var move = function (x, bottomY) {
                var dstY = (bottomY - axisHeight);
                var limY = (minY - 1);
                var y = Math.min(dstY, limY);
                g.attr('transform', translate(x, y));

                var svgFilter = (dstY < limY) ? {filter: 'url(#drop-shadow)'} : {filter:''};
                rect.style(svgFilter);
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
            var rect = g.select('.i-role-bg');

            var move = function (topX, y) {
                var limX = 0;
                var x = Math.max(topX, limX);
                g.attr('transform', translate(x, y));

                var svgFilter = (x > limX) ? {filter: 'url(#drop-shadow)'} : {filter:''};
                rect.style(svgFilter);
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

        var extractCenter = function (scrollableArea, scrollBarWidth, srcSvg, xSel, ySel) {
            var width = srcSvg.attr('width');
            var height = srcSvg.attr('height');
            var w = mmax(extractAxesInfo(ySel).xs) + 1;
            var y = mmin(extractAxesInfo(xSel).ys);
            var h = height - y + 1 + scrollBarWidth;
            var x = 0;

            var shadowSize = shadowStdDev * 2;
            var g = addBackground(createSlot(srcSvg), w + shadowSize, h + shadowSize, settings.bgcolor, true);

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

        var show = function (sel) {
            sel.style('visibility', '');
        };

        var hide = function (sel) {
            sel.style('visibility', 'hidden');
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
                var srcSvg = d3.select(this._chart.getSVG());
                srcSvg.selectAll('.floating-axes').remove();
            },

            destroy: function () {
                this.recycle();
            },

            onRender: function () {

                var self = this;
                var chart = this._chart;

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

                    var defs = srcSvg.append('defs');

                    defs.attr('class', 'floating-axes');

                    // create filter with id #drop-shadow
                    // height=130% so that the shadow is not clipped
                    var filter = defs
                        .append('filter')
                        .attr('id', 'drop-shadow')
                        .attr('height', '130%');

                    // SourceAlpha refers to opacity of graphic that this filter will be applied to
                    // convolve that with a Gaussian with standard deviation 3 and store result
                    // in blur
                    filter
                        .append('feGaussianBlur')
                        .attr('in', 'SourceAlpha')
                        .attr('stdDeviation', shadowStdDev)
                        .attr('result', 'blur');

                    // translate output of Gaussian blur to the right and downwards with 2px
                    // store result in offsetBlur
                    filter
                        .append('feOffset')
                        .attr('in', 'blur')
                        .attr('dx', 0)
                        .attr('dy', 0)
                        .attr('result', 'offsetBlur');

                    // overlay original SourceGraphic over translated blurred opacity by using
                    // feMerge filter. Order of specifying inputs is important!
                    var feMerge = filter.append('feMerge');

                    feMerge
                        .append('feMergeNode')
                        .attr('in', 'offsetBlur');
                    feMerge
                        .append('feMergeNode')
                        .attr('in', 'SourceGraphic');

                    var xSel = srcSvg.selectAll('.cell .x.axis');
                    var ySel = srcSvg.selectAll('.cell .y.axis');

                    show(xSel);
                    show(ySel);

                    var sw = tauCharts.api.globalSettings.getScrollBarWidth(root);

                    this.handlers = [
                        extractXAxesNew(root, sw, srcSvg, xSel),
                        extractYAxesNew(root, srcSvg, ySel),
                        extractCenter(root, sw, srcSvg, xSel, ySel)
                    ];

                    hide(xSel);
                    hide(ySel);

                    this.handlers.forEach(function (item) {
                        root.addEventListener('scroll', item.handler, false);
                    });

                    chart.on('beforeExportSVGNode', function() {
                        self.handlers.forEach(function (item) {
                            hide(item.element);
                        });
                        show(xSel);
                        show(ySel);
                    });

                    chart.on('afterExportSVGNode', function() {
                        self.handlers.forEach(function (item) {
                            show(item.element);
                        });
                        hide(xSel);
                        hide(ySel);
                    });
                }
            }
        };
    }

    tauCharts.api.plugins.add('floating-axes', floatingAxes);

    return floatingAxes;
});