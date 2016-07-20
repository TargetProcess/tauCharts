import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {Element} from './element';
import {CartesianModel} from '../models/cartesian';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_bottom_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoid_labels_collisions
    } from '../utils/d3-decorators';

export class Cartesian extends Element {

    constructor(config) {

        super(config);

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

        if (_.isString(this.config.guide.x.label)) {
            this.config.guide.x.label = {
                text: this.config.guide.x.label
            };
        }

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

        if (_.isString(this.config.guide.y.label)) {
            this.config.guide.y.label = {
                text: this.config.guide.y.label
            };
        }

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
            var diff = (containerHeight - (unit.options.top + unit.options.height));
            guide.x.hide = (Math.floor(diff) > 0);
            guide.y.hide = (Math.floor(unit.options.left) > 0);
        }

        this._createScales(config.fnCreateScale);
    }

    _createScales(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
        this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

        this.W = innerWidth;
        this.H = innerHeight;

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale);
    }

    buildModel(args) {

        return [
            CartesianModel.decorator_size,
            CartesianModel.decorator_color
        ].filter(x => x).reduce(
            ((model, transform) => transform(model, args)),
            (new CartesianModel({
                scaleX: args.scaleX,
                scaleY: args.scaleY,
                xi: (() => args.w / 2),
                yi: (() => args.h / 2),
                sizeX: (() => args.w),
                sizeY: (() => args.h)
            })));
    }

    walkFrames(frames, continuation) {

        var model = this.buildModel({
            scaleX: this.xScale,
            scaleY: this.yScale,
            w: this.W,
            h: this.H
        });

        frames.forEach((frame) => {

            var k = frame.key;
            var options = {
                left: (model.xi(k) - model.sizeX(k) / 2),
                top: (model.yi(k) - model.sizeY(k) / 2),
                width: (model.sizeX(k)),
                height: (model.sizeY(k))
            };

            frame.units.forEach((unit) => {
                unit.options = options;
                continuation(unit, frame);
            });
        });
    }

    drawFrames(frames, continuation) {

        var model = this.buildModel({
            scaleX: this.xScale,
            scaleY: this.yScale,
            w: this.W,
            h: this.H
        });

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

        // take into account reposition during resize by orthogonal axis
        var hashX = node.x.getHash() + innerHeight;
        var hashY = node.y.getHash() + innerWidth;

        if (!node.x.guide.hide) {
            var orientX = node.x.guide.scaleOrient;
            var positionX = ((orientX === 'top') ?
                [0, 0 - node.guide.x.padding] :
                [0, innerHeight + node.guide.x.padding]);

            this._fnDrawDimAxis(
                options.container,
                node.x,
                positionX,
                innerWidth,
                (`${options.frameId}x`),
                hashX
            );
        }

        if (!node.y.guide.hide) {
            var orientY = node.y.guide.scaleOrient;
            var positionY = ((orientY === 'right') ?
                [innerWidth + node.guide.y.padding, 0] :
                [0 - node.guide.y.padding, 0]);

            this._fnDrawDimAxis(
                options.container,
                node.y,
                positionY,
                innerHeight,
                (`${options.frameId}y`),
                hashY
            );
        }

        var updateCellLayers = (cellId, cell, frame) => {

            var mapper = ((basicOptions, unit, i) => {
                unit.options = _.extend({uid: basicOptions.frameId + i}, basicOptions);
                return unit;
            }).bind(
                null,
                {
                    frameId: frame.hash(),
                    container: cell,
                    containerWidth: innerWidth,
                    containerHeight: innerHeight,
                    left: (model.xi(frame.key) - model.sizeX(frame.key) / 2),
                    top: (model.yi(frame.key) - model.sizeY(frame.key) / 2),
                    width: (model.sizeX(frame.key)),
                    height: (model.sizeY(frame.key))
                });

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
                        d3_decorator_prettify_categorical_axis_ticks(refAxisNode, scale, isHorizontal);
                    }

                    d3_decorator_wrap_tick_label(refAxisNode, scale.guide, isHorizontal, scale);

                    if (prettifyTick && scale.guide.avoidCollisions) {
                        d3_decorator_avoid_labels_collisions(refAxisNode, isHorizontal);
                    }

                    if (!scale.guide.label.hide) {
                        d3_decorator_prettify_axis_label(refAxisNode, scale.guide.label, isHorizontal);
                    }

                    if (isHorizontal && (scale.scaleType === 'time')) {
                        d3_decorator_fix_horizontal_axis_ticks_overflow(refAxisNode);
                    }
                }
            });
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

                    if ((linesOptions.indexOf('x') > -1)) {
                        let xScale = node.x;
                        let xOrientKoeff = ((xScale.guide.scaleOrient === 'top') ? (-1) : (1));
                        var xGridAxis = d3.svg
                            .axis()
                            .scale(xScale.scaleObj)
                            .orient(xScale.guide.scaleOrient)
                            .tickSize(xOrientKoeff * height);

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
                            d3_decorator_prettify_categorical_axis_ticks(xGridLines, xScale, isHorizontal);
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

                    if ((linesOptions.indexOf('y') > -1)) {
                        let yScale = node.y;
                        let yOrientKoeff = ((yScale.guide.scaleOrient === 'right') ? (1) : (-1));
                        var yGridAxis = d3.svg
                            .axis()
                            .scale(yScale.scaleObj)
                            .orient(yScale.guide.scaleOrient)
                            .tickSize(yOrientKoeff * width);

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
                            d3_decorator_prettify_categorical_axis_ticks(yGridLines, yScale, isHorizontal);
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