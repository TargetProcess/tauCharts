import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_bottom_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks
    } from '../utils/d3-decorators';

export class Cartesian {

    constructor(config) {
        super();

        this.config = config;

        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                showGridLines: 'xy',
                padding: {l: 50, r: 0, t: 0, b: 50}
            });

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = _.defaults(
            this.config.guide.x,
            {
                cssClass: 'x axis',
                textAnchor: 'middle',
                padding: 10,
                hide: false,
                scaleOrient: 'bottom',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            }
        );

        this.config.guide.x.label = _.defaults(
            this.config.guide.x.label,
            {
                text: 'X',
                rotate: 0,
                padding: 40,
                textAnchor: 'middle'
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = _.defaults(
            this.config.guide.y,
            {
                cssClass: 'y axis',
                textAnchor: 'start',
                padding: 10,
                hide: false,
                scaleOrient: 'left',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

        this.config.guide.y.label = _.defaults(
            this.config.guide.y.label,
            {
                text: 'Y',
                rotate: -90,
                padding: 20,
                textAnchor: 'middle'
            }
        );

        var unit = this.config;
        var guide = unit.guide;
        if (guide.autoLayout === 'extract-axes') {
            var containerHeight = unit.options.containerHeight;
            guide.x.hide = ((unit.options.top + unit.options.height) < containerHeight);
            guide.y.hide = ((unit.options.left > 0));
        }
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
        this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

        this.W = innerWidth;
        this.H = innerHeight;

        return this;
    }

    drawFrames(frames, continuation) {

        var node = _.extend({}, this.config);

        var options = node.options;
        var padding = node.guide.padding;

        var innerLeft = options.left + padding.l;
        var innerTop = options.top + padding.t;

        var innerWidth = this.W;
        var innerHeight = this.H;

        node.x = this.xScale;
        node.y = this.yScale;

        node.x.scaleObj = this.xScale;
        node.y.scaleObj = this.yScale;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        node.x.guide.label.size = innerWidth;
        node.y.guide.label.size = innerHeight;

        options
            .container
            .attr('transform', utilsDraw.translate(innerLeft, innerTop));

        var hashX = node.x.getHash();
        var hashY = node.y.getHash();

        if (!node.x.guide.hide) {
            this._fnDrawDimAxis(
                options.container,
                node.x,
                [0, innerHeight + node.guide.x.padding],
                innerWidth,
                (`${options.frameId}x`),
                hashX
            );
        }

        if (!node.y.guide.hide) {
            this._fnDrawDimAxis(
                options.container,
                node.y,
                [0 - node.guide.y.padding, 0],
                innerHeight,
                (`${options.frameId}y`),
                hashY
            );
        }

        var updateCellLayers = (cellId, cell, frame) => {

            var mapper;
            var frameId = frame.hash();
            if (frame.key) {

                var coordX = node.x(frame.key[node.x.dim]);
                var coordY = node.y(frame.key[node.y.dim]);

                var xDomain = node.x.domain();
                var yDomain = node.y.domain();

                var xPart = innerWidth / xDomain.length;
                var yPart = innerHeight / yDomain.length;

                mapper = (unit, i) => {
                    unit.options = {
                        uid: frameId + i,
                        frameId: frameId,
                        container: cell,
                        containerWidth: innerWidth,
                        containerHeight: innerHeight,
                        left: coordX - xPart / 2,
                        top: coordY - yPart / 2,
                        width: xPart,
                        height: yPart
                    };
                    return unit;
                };
            } else {
                mapper = (unit, i) => {
                    unit.options = {
                        uid: frameId + i,
                        frameId: frameId,
                        container: cell,
                        containerWidth: innerWidth,
                        containerHeight: innerHeight,
                        left: 0,
                        top: 0,
                        width: innerWidth,
                        height: innerHeight
                    };
                    return unit;
                };
            }

            var continueDrawUnit = function (unit) {
                unit.options.container = d3.select(this);
                continuation(unit, frame);
            };

            var layers = cell
                .selectAll(`.layer_${cellId}`)
                .data(frame.units.map(mapper), (unit) => (unit.options.uid + unit.type));
            layers
                .exit()
                .remove();
            layers
                .each(continueDrawUnit);
            layers
                .enter()
                .append('g')
                .attr('class', `layer_${cellId}`)
                .each(continueDrawUnit);
        };

        var cellFrameIterator = function (cellFrame) {
            updateCellLayers(options.frameId, d3.select(this), cellFrame);
        };

        var cells = this
            ._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId, hashX + hashY)
            .selectAll(`.parent-frame-${options.frameId}`)
            .data(frames, (f) => f.hash());
        cells
            .exit()
            .remove();
        cells
            .each(cellFrameIterator);
        cells
            .enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell parent-frame-${options.frameId} frame-${d.hash()}`))
            .each(cellFrameIterator);
    }

    _fnDrawDimAxis(container, scale, position, size, frameId, uniqueHash) {

        if (scale.scaleDim) {

            var axisScale = d3.svg
                .axis()
                .scale(scale.scaleObj)
                .orient(scale.guide.scaleOrient);

            var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
            if (formatter !== null) {
                axisScale.ticks(Math.round(size / scale.guide.density));
                axisScale.tickFormat(formatter);
            }

            var axis = container
                .selectAll('.axis_' + frameId)
                .data([uniqueHash], (x) => x);
            axis.exit()
                .remove();
            axis.enter()
                .append('g')
                .attr('class', scale.guide.cssClass + ' axis_' + frameId)
                .attr('transform', utilsDraw.translate(...position))
                .call(function (refAxisNode) {
                    if (!refAxisNode.empty()) {

                        axisScale.call(this, refAxisNode);

                        var isHorizontal = (utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h');
                        var prettifyTick = (scale.scaleType === 'ordinal' || scale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(refAxisNode, size, isHorizontal);
                        }

                        d3_decorator_wrap_tick_label(refAxisNode, scale.guide, isHorizontal);
                        d3_decorator_prettify_axis_label(refAxisNode, scale.guide.label, isHorizontal);

                        if (isHorizontal && (scale.scaleType === 'time')) {
                            d3_decorator_fix_horizontal_axis_ticks_overflow(refAxisNode);
                        }
                    }
                });
        }
    }

    _fnDrawGrid(container, node, height, width, frameId, uniqueHash) {

        var grid = container
            .selectAll('.grid_' + frameId)
            .data([uniqueHash], (x) => x);
        grid.exit()
            .remove();
        grid.enter()
            .append('g')
            .attr('class', 'grid grid_' + frameId)
            .attr('transform', utilsDraw.translate(0, 0))
            .call((selection) => {

                if (selection.empty()) {
                    return;
                }

                var grid = selection;

                var linesOptions = (node.guide.showGridLines || '').toLowerCase();
                if (linesOptions.length > 0) {

                    var gridLines = grid.append('g').attr('class', 'grid-lines');

                    if ((linesOptions.indexOf('x') > -1) && node.x.scaleDim) {
                        let xScale = node.x;
                        var xGridAxis = d3.svg
                            .axis()
                            .scale(xScale.scaleObj)
                            .orient(xScale.guide.scaleOrient)
                            .tickSize(height);

                        let formatter = FormatterRegistry.get(xScale.guide.tickFormat);
                        if (formatter !== null) {
                            xGridAxis.ticks(Math.round(width / xScale.guide.density));
                            xGridAxis.tickFormat(formatter);
                        }

                        var xGridLines = gridLines
                            .append('g')
                            .attr('class', 'grid-lines-x')
                            .call(xGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (xScale.scaleType === 'ordinal' || xScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(xGridLines, width, isHorizontal);
                        }

                        var firstXGridLine = xGridLines.select('g.tick');
                        if (firstXGridLine.node() && firstXGridLine.attr('transform') !== 'translate(0,0)') {
                            var zeroNode = firstXGridLine.node().cloneNode(true);
                            gridLines.node().appendChild(zeroNode);
                            d3.select(zeroNode)
                                .attr('class', 'border')
                                .attr('transform', utilsDraw.translate(0, 0))
                                .select('line')
                                .attr('x1', 0)
                                .attr('x2', 0);
                        }
                    }

                    if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
                        let yScale = node.y;
                        var yGridAxis = d3.svg
                            .axis()
                            .scale(yScale.scaleObj)
                            .orient(yScale.guide.scaleOrient)
                            .tickSize(-width);

                        let formatter = FormatterRegistry.get(yScale.guide.tickFormat);
                        if (formatter !== null) {
                            yGridAxis.ticks(Math.round(height / yScale.guide.density));
                            yGridAxis.tickFormat(formatter);
                        }

                        var yGridLines = gridLines
                            .append('g')
                            .attr('class', 'grid-lines-y')
                            .call(yGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (yScale.scaleType === 'ordinal' || yScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(yGridLines, height, isHorizontal);
                        }

                        let fixLineScales = ['time', 'ordinal', 'period'];
                        let fixBottomLine = _.contains(fixLineScales, yScale.scaleType);
                        if (fixBottomLine) {
                            d3_decorator_fix_axis_bottom_line(yGridLines, height, (yScale.scaleType === 'time'));
                        }
                    }

                    gridLines.selectAll('text').remove();
                }
            });

        return grid;
    }
}