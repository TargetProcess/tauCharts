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
    var d3 = tauCharts.api.d3;

    var SHADOW_SIZE = 16;
    var SHADOW_COLOR_0 = '#E5E7EB';
    var SHADOW_COLOR_1 = '#FFFFFF';
    var SHADOW_OPACITY_0 = 1;
    var SHADOW_OPACITY_1 = 0;

    var storeProp = '__transitionAttrs__';
    var parentProp = '__floatingAxesSrcParent__';
    var transProp = '__floatingAxesSrcTransform__';

    function floatingAxes(xSettings) {

        var settings = utils.defaults(xSettings || {}, {
            bgcolor: '#fff'
        });

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
            var result = {x: 0, y: 0, r: 0};
            if (!transform) {
                return result;
            }
            var ts = transform.indexOf('translate(');
            if (ts >= 0) {
                var te = transform.indexOf(')', ts + 10);
                var translateStr = transform.substring(ts + 10, te);
                var translateParts = translateStr.trim().replace(',', ' ').replace(/\s+/, ' ').split(' ');
                result.x = parseFloat(translateParts[0]);
                if (translateParts.length > 1) {
                    result.y = parseFloat(translateParts[1]);
                }
            }
            var rs = transform.indexOf('rotate(');
            if (rs >= 0) {
                var re = transform.indexOf(')', rs + 7);
                var rotateStr = transform.substring(rs + 7, re);
                result.r = parseFloat(rotateStr.trim());
            }
            return result;
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
                    info.translate0.x += currentTransform.x;
                    info.translate0.y += currentTransform.y;
                    info.translate.x += nextTransform.x;
                    info.translate.y += nextTransform.y;
                    parent = parent.parentNode;
                }
                axes.push(info);
            });

            return axes;
        };

        var createSlot = function (d3Svg, w, h) {
            var slot = d3Svg.append('g');
            slot.attr('class', 'floating-axes');
            addBackground(slot, w, h);
            return slot;
        };

        var addBackground = function (cont, w, h) {
            // TODO: What is "2", "-1"?
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
                    fill: settings.bgcolor
                });

            return cont;
        };

        var addAxes = function (g, axes) {
            var container = g.node();
            axes.forEach(function (node) {
                node[parentProp] = node.parentNode;
                node[transProp] = (node[storeProp] && node[storeProp].transform ?
                    node[storeProp].transform :
                    node.getAttribute('transform'));
                Array.prototype.forEach.call(
                    node.querySelectorAll('.label'),
                    function (label) {
                        label[transProp] = label.getAttribute('transform');
                    }
                );
                container.appendChild(node);
            });
            return g;
        };

        var extractXAxes = function (getPositions, srcSvg, xAxesInfo, animationSpeed, visibilityManager) {
            var pos = getPositions();
            var axes = xAxesInfo.map(function (info) {
                return info.axis;
            });

            var axisHeight = pos.svgHeight - pos.minXAxesY + 1 + pos.scrollbarHeight;

            var g = addAxes(createSlot(srcSvg, pos.svgWidth, axisHeight), axes);
            xAxesInfo.forEach(function (info) {
                translateAxis(
                    info.axis,
                    // NOTE: No vertical transition.
                    info.translate0.x, info.translate.y - pos.minXAxesY,
                    info.translate.x, info.translate.y - pos.minXAxesY,
                    animationSpeed
                );
            });
            var labels = g.selectAll('.label');
            visibilityManager.register(g, 'y');
            visibilityManager.register(labels, 'x');

            var move = function (scrollLeft, scrollTop) {
                var x = 0;
                var yLimit = pos.minXAxesY;
                var y = Math.min(
                    (pos.visibleHeight + scrollTop + pos.minXAxesY - pos.svgHeight - pos.scrollbarHeight),
                    yLimit
                );
                g.attr('transform', translate(x, y));
                labels.each(function () {
                    var t = parseTransform(this[transProp]);
                    var dx = -pos.svgWidth / 2 + pos.visibleWidth / 2 + scrollLeft;
                    this.setAttribute(
                        'transform',
                        'translate(' + (t.x + dx) + ',' + t.y + ') rotate(' + t.r + ')'
                    );
                });
            };

            move(pos.scrollLeft, pos.scrollTop);

            return {
                element: g,
                handler: function () {
                    var pos = getPositions();
                    move(pos.scrollLeft, pos.scrollTop);
                }
            };
        };

        var extractYAxes = function (getPositions, srcSvg, yAxesInfo, animationSpeed, visibilityManager) {
            var pos = getPositions();
            var axes = yAxesInfo.map(function (info) {
                return info.axis;
            });

            var g = addAxes(createSlot(srcSvg, pos.maxYAxesX, pos.svgHeight), axes);
            yAxesInfo.forEach(function (info, i) {
                translateAxis(
                    info.axis,
                    // NOTE: No horizontal transition.
                    info.translate.x, info.translate0.y,
                    info.translate.x, info.translate.y,
                    animationSpeed
                );
            });
            var labels = g.selectAll('.label');
            visibilityManager.register(g, 'x');
            visibilityManager.register(labels, 'y');

            var move = function (scrollLeft, scrollTop) {
                var xLimit = 0;
                var x = Math.max(scrollLeft, xLimit);
                var y = 0;
                g.attr('transform', translate(x, y));
                labels.each(function () {
                    var t = parseTransform(this[transProp]);
                    var dy = -pos.svgHeight / 2 + pos.visibleHeight / 2 + scrollTop;
                    this.setAttribute(
                        'transform',
                        'translate(' + t.x + ',' + (t.y + dy) + ') rotate(' + t.r + ')'
                    );
                });
            };
            move(pos.scrollLeft, pos.scrollTop);

            return {
                element: g,
                handler: function () {
                    var pos = getPositions();
                    move(pos.scrollLeft, pos.scrollTop);
                }
            };
        };

        var createCorner = function (getPositions, srcSvg, visibilityManager) {
            var pos = getPositions();
            var xAxesHeight = pos.svgHeight - pos.minXAxesY + pos.scrollbarHeight;

            var g = createSlot(srcSvg, pos.maxYAxesX, xAxesHeight);
            visibilityManager.register(g, 'xy');

            var move = function (scrollLeft, scrollTop) {
                var bottomY = scrollTop + pos.visibleHeight;
                var xLimit = 0;
                var x = Math.max(scrollLeft, xLimit);
                var yLimit = pos.minXAxesY;
                var y = Math.min(
                    (scrollTop + pos.visibleHeight - xAxesHeight),
                    yLimit
                );
                g.attr('transform', translate(x, y));
            };
            move(pos.scrollLeft, pos.scrollTop);

            return {
                element: g,
                handler: function () {
                    var pos = getPositions();
                    move(pos.scrollLeft, pos.scrollTop);
                }
            };
        };

        var createShadows = function (getPositions, srcSvg, visibilityManager) {
            var pos = getPositions();
            var yAxesWidth = pos.maxYAxesX;
            var xAxesHeight = pos.svgHeight - pos.minXAxesY + pos.scrollbarHeight;

            var g = srcSvg.append('g')
                .attr('class', 'floating-axes floating-axes-shadows')
                .attr('pointer-events', 'none');

            var createShadow = function (direction, x, y, width, height) {
                return g.append('rect')
                    .attr('fill', 'url(#shadow-gradient-' + direction + ')')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', width)
                    .attr('height', height);
            };
            var shadowNS = createShadow('ns', 0, 0, yAxesWidth, SHADOW_SIZE);
            var shadowEW = createShadow('ew',
                pos.visibleWidth - SHADOW_SIZE - pos.scrollbarWidth,
                pos.visibleHeight - xAxesHeight,
                SHADOW_SIZE,
                xAxesHeight
            );
            var shadowSN = createShadow('sn',
                0,
                pos.visibleHeight - xAxesHeight - SHADOW_SIZE,
                yAxesWidth,
                SHADOW_SIZE
            );
            var shadowWE = createShadow('we', yAxesWidth, pos.visibleHeight - xAxesHeight, SHADOW_SIZE, xAxesHeight);

            visibilityManager.register(shadowNS, 'xy');
            visibilityManager.register(shadowEW, 'xy');
            visibilityManager.register(shadowSN, 'xy');
            visibilityManager.register(shadowWE, 'xy');

            var move = function (scrollLeft, scrollTop) {
                var pos = getPositions();
                var x = scrollLeft;
                var y = scrollTop;
                g.attr('transform', translate(x, y));

                // Hide/show shadows
                var toggle = function (el, show) {
                    el.style('visibility', show ? '' : 'hidden');
                };
                toggle(shadowNS, pos.scrollTop > 0 && pos.svgHeight > pos.visibleHeight);
                toggle(shadowEW,
                    (pos.scrollLeft + pos.visibleWidth < pos.svgWidth) &&
                    (pos.svgWidth > pos.visibleWidth));
                toggle(shadowSN,
                    (pos.scrollTop + pos.visibleHeight < pos.svgHeight) &&
                    (pos.svgHeight > pos.visibleHeight));
                toggle(shadowWE, pos.scrollLeft > 0 && pos.svgWidth > pos.visibleWidth);
            };
            move(pos.scrollLeft, pos.scrollTop);

            return {
                element: g,
                handler: function () {
                    var pos = getPositions();
                    move(pos.scrollLeft, pos.scrollTop);
                }
            };
        };

        var translateAxis = function (axisNode, x0, y0, x1, y1, animationSpeed) {
            if (animationSpeed > 0) {
                d3.select(axisNode)
                    .attr('transform', translate(x0, y0))
                    .transition('axisTransition')
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
                this.rootNode = chart.getLayout().contentContainer;
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
                        Array.prototype.forEach.call(
                            this.querySelectorAll('.label'),
                            function (label) {
                                label.setAttribute('transform', label[transProp]);
                                delete label[transProp];
                            }
                        );
                    });
                    item.element.remove();
                });
                this._visibilityManager && this._visibilityManager.destroy();
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

                    var defs = srcSvg.append('defs')
                        .attr('class', 'floating-axes');

                    // Create shadow gradients definitions
                    var directions = {
                        ns: {x1: 0, y1: 0, x2: 0, y2: 1},
                        ew: {x1: 1, y1: 0, x2: 0, y2: 0},
                        sn: {x1: 0, y1: 1, x2: 0, y2: 0},
                        we: {x1: 0, y1: 0, x2: 1, y2: 0}
                    };
                    Object.keys(directions).forEach(function createGradient(direction) {
                        // TODO: Use class prefix.
                        var coords = directions[direction];
                        var g = defs.append('linearGradient')
                            .attr('id', 'shadow-gradient-' + direction)
                            .attr('x1', coords.x1)
                            .attr('y1', coords.y1)
                            .attr('x2', coords.x2)
                            .attr('y2', coords.y2);
                        g.append('stop')
                            .attr('class', 'floating-axes_shadow-start')
                            .attr('offset', '0%')
                            .attr('stop-color', SHADOW_COLOR_0)
                            .attr('stop-opacity', SHADOW_OPACITY_0);
                        g.append('stop')
                            .attr('class', 'floating-axes_shadow-end')
                            .attr('offset', '100%')
                            .attr('stop-color', SHADOW_COLOR_1)
                            .attr('stop-opacity', SHADOW_OPACITY_1);
                    });

                    // Move axes into Floating Axes container
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

                    var xAxesInfo = extractAxesInfo(xSel);
                    var yAxesInfo = extractAxesInfo(ySel);

                    var maxYAxesX = mmax(yAxesInfo.map(function (info) {
                        return info.translate.x;
                    })) + 1;
                    var minXAxesY = mmin(xAxesInfo.map(function (info) {
                        return info.translate.y;
                    })) - 1;

                    var scrollRect = root.getBoundingClientRect();
                    var scrollbars = tauCharts.api.globalSettings.getScrollbarSize(root);
                    var visibleWidth = scrollRect.width;
                    var visibleHeight = scrollRect.height;

                    var getPositions = function () {
                        return {
                            scrollLeft: root.scrollLeft,
                            scrollTop: root.scrollTop,
                            visibleWidth: scrollRect.width,
                            visibleHeight: scrollRect.height,
                            scrollbarWidth: scrollbars.width,
                            scrollbarHeight: scrollbars.height,
                            svgWidth: Number(srcSvg.attr('width')),
                            svgHeight: Number(srcSvg.attr('height')),
                            minXAxesY: minXAxesY,
                            maxYAxesX: maxYAxesX
                        };
                    };

                    var animationSpeed = chart.configGPL.settings.animationSpeed;

                    this._visibilityManager = new VisibilityScrollManager(root);
                    var vm = this._visibilityManager;

                    this.handlers = [
                        extractXAxes(getPositions, srcSvg, xAxesInfo, animationSpeed, vm),
                        extractYAxes(getPositions, srcSvg, yAxesInfo, animationSpeed, vm),
                        createCorner(getPositions, srcSvg, vm),
                        createShadows(getPositions, srcSvg, vm)
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

    /**
     * NOTE: As far as floating axes and labels jump during scroll
     * in most of browsers (except Chrome with big delta mousewheel)
     * due to the fact, that browser renders scrolled content first,
     * and only later fires `scroll` event, letting us return axes in place,
     * we are hiding floating axes, and show them after some delay.
     */
    var VisibilityScrollManager = (function () {

        var HIDE_SCROLL_ITEMS_DURATION = 128;
        var SHOW_SCROLL_ITEMS_DURATION = 256;

        var callSelections = function (arrayOfSelections, fn, context) {
            arrayOfSelections.forEach(function (s) {
                fn.call(context, s);
            });
        };

        function VisibilityScrollManager(scrollContainer) {
            this._xItems = [];
            this._yItems = [];
            this._prevScrollLeft = 0;
            this._prevScrollTop = 0;
            this._scrollXTimeout = null;
            this._scrollYTimeout = null;
            this._scrollContainer = scrollContainer;
            this._scrollHandler = this._onScroll.bind(this);
            scrollContainer.addEventListener('scroll', this._scrollHandler);
        };

        VisibilityScrollManager.prototype.register = function (d3Selection, scrollDirection) {
            if (scrollDirection.indexOf('x') >= 0) {
                this._xItems.push(d3Selection);
            }
            if (scrollDirection.indexOf('y') >= 0) {
                this._yItems.push(d3Selection);
            }
        };

        VisibilityScrollManager.prototype._onScroll = function () {
            var handleScroll = function (isX) {
                var scrollPos = isX ? 'scrollLeft' : 'scrollTop';
                var prevScrollPos = isX ? '_prevScrollLeft' : '_prevScrollTop';
                var scrollTimeout = isX ? '_scrollXTimeout' : '_scrollYTimeout';
                var items = isX ? '_xItems' : '_yItems';
                if (this._scrollContainer[scrollPos] !== this[prevScrollPos]) {
                    clearTimeout(this[scrollTimeout]);
                    callSelections(this[items], function (s) {
                        s.transition('floatingAxes_scrollVisibility'); // Stop transition
                        s.attr('opacity', 1e-6);
                    });
                    this[scrollTimeout] = setTimeout(function () {
                        callSelections(this[items], function (s) {
                            this[scrollTimeout] = null;
                            s.transition('floatingAxes_scrollVisibility')
                                .duration(SHOW_SCROLL_ITEMS_DURATION)
                                .attr('opacity', 1);
                        }, this);
                    }.bind(this), HIDE_SCROLL_ITEMS_DURATION);
                }
                this[prevScrollPos] = this._scrollContainer[scrollPos];
            }.bind(this);
            handleScroll(true);
            handleScroll(false);
        };

        VisibilityScrollManager.prototype.destroy = function () {
            this._scrollContainer.removeEventListener('scroll', this._scrollHandler);
        };

        return VisibilityScrollManager;
    })();

    tauCharts.api.plugins.add('floating-axes', floatingAxes);

    return floatingAxes;
});