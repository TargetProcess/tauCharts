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

    var storeProp = '__transitionAttrs__';
    var parentProp = '__floatingAxesSrcParent__';
    var transProp = '__floatingAxesSrcTransform__';

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
            return ('translate(' + x + ',' + y + ')');
        };

        var parseTransform = function (transform) {
            if (!transform || transform.indexOf('translate(') !== 0) {
                return null;
            }
            return transform
                .replace('translate(', '')
                .replace(')', '')
                .replace(' ', ',')
                .split(',')
                .concat(0)
                .slice(0, 2)
                .map(function (x) {
                    return Number(x);
                });
        };

        var extractAxesInfo = function (selection) {
            var axes = [];
            selection.each(function () {
                var info = {
                    axis: this,
                    translate0: {x: 0, y: 0},
                    translate: {x: 0, y: 0}
                };
                var parent = this;
                var isTransformInTransition, currentTransform, nextTransform;
                while (parent.nodeName.toUpperCase() !== 'SVG') {
                    isTransformInTransition = (parent[storeProp] &&
                        parent[storeProp].transform);
                    currentTransform = parseTransform(parent.getAttribute('transform'));
                    nextTransform = (isTransformInTransition ?
                        parseTransform(parent[storeProp].transform) :
                        currentTransform);
                    if (currentTransform) {
                        info.translate0.x += currentTransform[0];
                        info.translate0.y += currentTransform[1];
                    }
                    if (nextTransform) {
                        info.translate.x += nextTransform[0];
                        info.translate.y += nextTransform[1];
                    }
                    parent = parent.parentNode;
                }
                axes.push(info);
            });

            return axes;
        };

        var createSlot = function (d3Svg, w, h, color, hideShadow) {
            var slot = d3Svg.append('g');
            slot.attr('class', 'floating-axes');
            addBackground(slot, w, h, color, hideShadow);
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
            var container = g.node();
            axes.forEach(function (node) {
                node[parentProp] = node.parentNode;
                node[transProp] = (node[storeProp] && node[storeProp].transform ?
                    node[storeProp].transform :
                    node.getAttribute('transform'));
                container.appendChild(node);
            });
            return g;
        };

        var extractXAxes = function (getScrollY, scrollbarHeight, srcSvg, axesInfo, animationSpeed) {
            var height = srcSvg.attr('height');
            var width = srcSvg.attr('width');
            var axes = axesInfo.map(function (info) {
                return info.axis;
            });

            var minY = mmin(axesInfo.map(function (info) {
                return info.translate.y;
            }));

            var axisHeight = height - minY + 1 + scrollbarHeight;

            var g = addAxes(createSlot(srcSvg, width, axisHeight, settings.bgcolor), axes);
            axesInfo.forEach(function (info) {
                translateAxis(
                    info.axis,
                    // NOTE: No vertical transition.
                    info.translate0.x, info.translate.y - minY,
                    info.translate.x, info.translate.y - minY,
                    animationSpeed
                );
            });
            var rect = g.select('.i-role-bg');

            var move = function (x, bottomY) {
                var dstY = (bottomY - axisHeight);
                var limY = (minY - 1);
                var y = Math.min(dstY, limY);
                g.attr('transform', translate(x, y));

                var svgFilter = (dstY < limY) ? {filter: 'url(#drop-shadow)'} : {filter:''};
                rect.style(svgFilter);
            };

            move(0, getScrollY());

            return {
                element: g,
                handler: function () {
                    move(0, getScrollY());
                }
            };
        };

        var extractYAxes = function (getScrollX, srcSvg, axesInfo, animationSpeed) {
            var width = srcSvg.attr('width');
            var height = srcSvg.attr('height');
            var axes = axesInfo.map(function (info) {
                return info.axis;
            });

            var axisWidth = mmax(axesInfo.map(function (info) {
                return info.translate.x;
            }));

            var g = addAxes(createSlot(srcSvg, axisWidth, height, settings.bgcolor), axes);
            axesInfo.forEach(function (info, i) {
                translateAxis(
                    info.axis,
                    // NOTE: No horizontal transition.
                    info.translate.x, info.translate0.y,
                    info.translate.x, info.translate.y,
                    animationSpeed
                );
            });
            var rect = g.select('.i-role-bg');

            var move = function (topX, y) {
                var limX = 0;
                var x = Math.max(topX, limX);
                g.attr('transform', translate(x, y));

                var svgFilter = (x > limX) ? {filter: 'url(#drop-shadow)'} : {filter:''};
                rect.style(svgFilter);
            };
            move(getScrollX(), 0);

            return {
                element: g,
                handler: function () {
                    move(getScrollX(), 0);
                }
            };
        };

        var extractCorner = function (getScrollX, getScrollY, scrollbarHeight, srcSvg, xAxesInfo, yAxesInfo) {
            var width = srcSvg.attr('width');
            var height = srcSvg.attr('height');
            var w = mmax(yAxesInfo.map(function (info) {
                return info.translate.x;
            })) + 1;
            var y = mmin(xAxesInfo.map(function (info) {
                return info.translate.y;
            }));
            var h = height - y + 1 + scrollbarHeight;
            var x = 0;

            var shadowSize = shadowStdDev * 2;
            var g = createSlot(srcSvg, w + shadowSize, h + shadowSize, settings.bgcolor, true);

            var move = function (topX, bottomY) {
                var xi = Math.max((topX), 0);
                var yi = Math.min((bottomY - h), (y - 1));
                g.attr('transform', translate(xi, yi));
            };
            move(getScrollX(), getScrollY());

            return {
                element: g,
                handler: function () {
                    move(getScrollX(), getScrollY());
                }
            };
        };

        var translateAxis = function(axisNode, x0, y0, x1, y1, animationSpeed) {
            if (animationSpeed > 0) {
                d3.select(axisNode)
                    .attr('transform', translate(x0, y0))
                    .transition()
                     // TODO: Determine, how much time passed since last transition beginning.
                    .duration(animationSpeed)
                    .attr('transform', translate(x1, y1));
            } else {
                axisNode.setAttribute('transform', translate(x1, y1));
            }
        };

        return {

            init: function (chart) {
                this._chart = chart;
                this.rootNode = chart.getLayout().content.parentNode;
                this.handlers = [];

                this._beforeExportHandler = chart.on('beforeExportSVGNode', function () {
                    this.recycle();
                }, this);
                this._afterExportHandler = chart.on('afterExportSVGNode', function () {
                    this.onRender();
                }, this);
            },

            recycle: function () {
                var root = this.rootNode;
                this.handlers.forEach(function (item) {
                    root.removeEventListener('scroll', item.handler);
                    item.element.selectAll('.axis').each(function () {
                        this[parentProp].appendChild(this);
                        this.setAttribute('transform', this[transProp]);
                        delete this[parentProp];
                        delete this[transProp];
                    });
                    item.element.remove();
                });
                var srcSvg = d3.select(this._chart.getSVG());
                // TODO: Reuse elements.
                srcSvg.selectAll('.floating-axes').remove();
            },

            destroy: function () {
                this.recycle();
                this._chart.removeHandler(this._beforeExportHandler, this);
                this._chart.removeHandler(this._afterExportHandler, this);
            },

            onRender: function () {

                var self = this;
                var chart = this._chart;

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

                    var getAxesSelector = function (axis) {
                        var axisPart = '> .' + axis + '.axis.tau-active';
                        var rootPart = '.frame-root.tau-active ';
                        return [
                            rootPart + axisPart,
                            rootPart + '.cell.tau-active ' + axisPart
                        ].join(', ');
                    };
                    var xSel = srcSvg.selectAll(getAxesSelector('x'));
                    var ySel = srcSvg.selectAll(getAxesSelector('y'));

                    var scrollableHeight = root.getBoundingClientRect().height;
                    var getScrollX = function () {
                        return root.scrollLeft;
                    };
                    var getScrollY = function () {
                        return (scrollableHeight + root.scrollTop);
                    };

                    var s = tauCharts.api.globalSettings.getScrollbarSize(root);
                    var xAxesInfo = extractAxesInfo(xSel);
                    var yAxesInfo = extractAxesInfo(ySel);
                    var animationSpeed = chart.configGPL.settings.animationSpeed;
                    this.handlers = [
                        extractXAxes(getScrollY, s.height, srcSvg, xAxesInfo, animationSpeed),
                        extractYAxes(getScrollX, srcSvg, yAxesInfo, animationSpeed),
                        extractCorner(getScrollX, getScrollY, s.height, srcSvg, xAxesInfo, yAxesInfo)
                    ];

                    this.handlers.forEach(function (item) {
                        root.addEventListener('scroll', item.handler, false);
                    });
                }
            },

            onBeforeRender: function () {
                this.recycle();
            }
        };
    }

    tauCharts.api.plugins.add('floating-axes', floatingAxes);

    return floatingAxes;
});