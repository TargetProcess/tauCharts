import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {Element} from './element';
import {CartesianModel} from '../models/cartesian';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_start_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoid_labels_collisions
} from '../utils/d3-decorators';
var selectOrAppend = utilsDom.selectOrAppend;

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

        var options = this.config.options;
        var padding = this.config.guide.padding;

        this.L = options.left + padding.l;
        this.T = options.top + padding.t;
        this.W = options.width - (padding.l + padding.r);
        this.H = options.height - (padding.t + padding.b);
    }

    createScales(fnCreateScale) {
        this.xScale = fnCreateScale('pos', this.config.x, [0, this.W]);
        this.yScale = fnCreateScale('pos', this.config.y, [this.H, 0]);
        this.regScale('x', this.xScale)
            .regScale('y', this.yScale);
    }

    walkFrames() {
        var w = this.W;
        var h = this.H;
        return [
            CartesianModel.decorator_size,
            CartesianModel.decorator_color
        ].filter(x => x).reduce(
            ((model, transform) => transform(model, {})),
            (new CartesianModel({
                scaleX: this.xScale,
                scaleY: this.yScale,
                xi: (() => w / 2),
                yi: (() => h / 2),
                sizeX: (() => w),
                sizeY: (() => h)
            })));
    }

    allocateRect(k) {
        var model = this.screenModel;
        return {
            slot: ((uid) => this.config.options.container.select(`.uid_${uid}`)),
            left: (model.xi(k) - model.sizeX(k) / 2),
            top: (model.yi(k) - model.sizeY(k) / 2),
            width: (model.sizeX(k)),
            height: (model.sizeY(k)),
            // TODO: Fix autoLayout.. redundant properties
            containerWidth: this.W,
            containerHeight: this.H
        };
    }

    drawFrames(frames) {

        var node = _.extend({}, this.config);

        var options = node.options;

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
            .attr('transform', utilsDraw.translate(this.L, this.T));

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
                (`${options.frameId}x`)
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
                (`${options.frameId}y`)
            );
        }

        var xdata = frames.reduce((memo, f) => {
            return memo.concat((f.units || []).map((unit) => unit.uid));
        }, []);

        var xcells = this
            ._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId)
            .selectAll('.cell')
            .data(xdata, x => x);
        xcells
            .exit()
            .remove();
        xcells
            .enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell uid_${d}`));
    }

    _fnDrawDimAxis(container, scale, position, size, frameId) {

        var axisScale = d3.svg
            .axis()
            .scale(scale.scaleObj)
            .orient(scale.guide.scaleOrient);

        var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
        if (formatter !== null) {
            axisScale.ticks(Math.round(size / scale.guide.density));
            axisScale.tickFormat(formatter);
        }

        selectOrAppend(container, `g.${scale.guide.cssClass.replace(/\s+/, '.')}.axis_${frameId}`)
            .attr('transform', utilsDraw.translate(...position))
            .call((refAxisNode) => {

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
            });
    }

    _fnDrawGrid(container, node, height, width, frameId) {

        var grid = selectOrAppend(container, `g.grid.grid_${frameId}`)
            .attr('transform', utilsDraw.translate(0, 0))
            .call((selection) => {

                var grid = selection;

                var trans = (selection) => {
                    if (this.config.guide.animationSpeed > 0) {
                        return selection
                            .transition()
                            .duration(this.config.guide.animationSpeed);
                    }
                    return selection;
                };

                var linesOptions = (node.guide.showGridLines || '').toLowerCase();
                if (linesOptions.length > 0) {

                    var gridLines = selectOrAppend(grid, 'g.grid-lines');

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

                        var xGridLines = selectOrAppend(gridLines, 'g.grid-lines-x');
                        var xGridLinesTrans = trans(xGridLines)
                            .call(xGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (xScale.scaleType === 'ordinal' || xScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(
                                xGridLinesTrans,
                                xScale,
                                isHorizontal,
                                this.config.guide.animationSpeed
                            );
                        }

                        let extraGridLines = selectOrAppend(gridLines, 'g.grid-lines-extra');
                        d3_decorator_fix_axis_start_line(
                            extraGridLines,
                            isHorizontal,
                            width,
                            height,
                            this.config.guide.animationSpeed
                        );
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

                        var yGridLines = selectOrAppend(gridLines, 'g.grid-lines-y');
                        var yGridLinesTrans = trans(yGridLines)
                            .call(yGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (yScale.scaleType === 'ordinal' || yScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(
                                yGridLinesTrans,
                                yScale,
                                isHorizontal,
                                this.config.guide.animationSpeed
                            );
                        }

                        let fixLineScales = ['time', 'ordinal', 'period'];
                        let fixBottomLine = _.contains(fixLineScales, yScale.scaleType);
                        if (fixBottomLine) {
                            let extraGridLines = selectOrAppend(gridLines, 'g.grid-lines-extra');
                            d3_decorator_fix_axis_start_line(
                                extraGridLines,
                                isHorizontal,
                                width,
                                height,
                                this.config.guide.animationSpeed
                            );
                        }
                    }

                    gridLines.selectAll('text').remove();
                }
            });

        return grid;
    }
}