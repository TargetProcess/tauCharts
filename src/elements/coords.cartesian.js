import {default as d3} from 'd3';
import {Element} from './element';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
import {utils} from '../utils/utils';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {
    d3_transition as transition,
    d3_selectAllImmediate as selectAllImmediate,
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_start_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoid_labels_collisions
} from '../utils/d3-decorators';
var selectOrAppend = utilsDom.selectOrAppend;

const calcTicks = (distributionKoeff) => {
    const limit = 20;
    const factor = ((distributionKoeff <= limit) ? 1 : 0.75);
    return Math.max(2, Math.round(distributionKoeff * factor));
};

export class Cartesian extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            this.config.guide || {},
            {
                showGridLines: 'xy',
                padding: {l: 50, r: 0, t: 0, b: 50}
            });

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = utils.defaults(
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

        if (typeof this.config.guide.x.label === 'string') {
            this.config.guide.x.label = {
                text: this.config.guide.x.label
            };
        }

        this.config.guide.x.label = utils.defaults(
            this.config.guide.x.label,
            {
                text: 'X',
                rotate: 0,
                padding: 40,
                textAnchor: 'middle'
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = utils.defaults(
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

        if (typeof this.config.guide.y.label === 'string') {
            this.config.guide.y.label = {
                text: this.config.guide.y.label
            };
        }

        this.config.guide.y.label = utils.defaults(
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

    defineGrammarModel(fnCreateScale) {
        const w = this.W;
        const h = this.H;
        this.xScale = fnCreateScale('pos', this.config.x, [0, w]);
        this.yScale = fnCreateScale('pos', this.config.y, [h, 0]);
        this.regScale('x', this.xScale)
            .regScale('y', this.yScale);
        return {
            scaleX: this.xScale,
            scaleY: this.yScale,
            xi: (() => w / 2),
            yi: (() => h / 2),
            sizeX: (() => w),
            sizeY: (() => h)
        };
    }

    getGrammarRules() {
        return [
            (prevModel) => {
                var sx = prevModel.scaleX;
                var sy = prevModel.scaleY;
                return {
                    xi: ((d) => (!d ? prevModel.xi(d) : sx(d[sx.dim]))),
                    yi: ((d) => (!d ? prevModel.yi(d) : sy(d[sy.dim]))),
                    sizeX: ((d) => (!d ? prevModel.sizeX(d) : sx.stepSize(d[sx.dim]))),
                    sizeY: ((d) => (!d ? prevModel.sizeY(d) : sy.stepSize(d[sy.dim])))
                };
            }
        ];
    }

    createScreenModel(grammarModel) {
        return grammarModel;
    }

    allocateRect(k) {
        var model = this.screenModel;
        return {
            slot: ((uid) => this.config.options.container.selectAll(`.uid_${uid}`)),
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

        var node = Object.assign({}, this.config);

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

        // TODO: Should we modify transform of a container here or create own container?
        (options.container.attr('transform') ?
            transition(options.container, this.config.guide.animationSpeed, 'cartesianContainerTransform') :
            options.container)
            .attr('transform', utilsDraw.translate(this.L, this.T));

        if (!node.x.guide.hide) {
            var orientX = node.x.guide.scaleOrient;
            var positionX = ((orientX === 'top') ?
                [0, 0 - node.guide.x.padding] :
                [0, innerHeight + node.guide.x.padding]);

            this._drawDimAxis(
                options.container,
                node.x,
                positionX,
                innerWidth
            );
        } else {
            this._removeDimAxis(options.container, node.x);
        }

        if (!node.y.guide.hide) {
            var orientY = node.y.guide.scaleOrient;
            var positionY = ((orientY === 'right') ?
                [innerWidth + node.guide.y.padding, 0] :
                [0 - node.guide.y.padding, 0]);

            this._drawDimAxis(
                options.container,
                node.y,
                positionY,
                innerHeight
            );
        } else {
            this._removeDimAxis(options.container, node.y);
        }

        var xdata = frames.reduce((memo, f) => {
            return memo.concat((f.units || []).map((unit) => unit.uid));
        }, []);

        var grid = this._drawGrid(options.container, node, innerWidth, innerHeight, options);
        var xcells = selectAllImmediate(grid, '.cell')
            .data(xdata, x => x);
        xcells
            .enter()
            .append('g')
            .attr('class', (d) => `${CSS_PREFIX}cell cell uid_${d}`);
        transition(xcells.classed('tau-active', true), this.config.guide.animationSpeed)
            .attr('opacity', 1);
        transition(xcells.exit().classed('tau-active', false), this.config.guide.animationSpeed)
            .attr('opacity', 1e-6)
            .remove();
    }

    _drawDimAxis(container, scale, position, size) {

        var axisScale = d3.svg
            .axis()
            .scale(scale.scaleObj)
            .orient(scale.guide.scaleOrient);

        var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
        if (formatter !== null) {
            axisScale.ticks(calcTicks(size / scale.guide.density));
            axisScale.tickFormat(formatter);
        }

        var animationSpeed = this.config.guide.animationSpeed;

        selectOrAppend(container, this._getAxisSelector(scale))
            .classed('tau-active', true)
            .classed(scale.guide.cssClass, true)
            .call((axis) => {

                var transAxis = transition(axis, animationSpeed, 'axisTransition');
                var prevAxisTranslate = axis.attr('transform');
                var nextAxisTranslate = utilsDraw.translate(...position);
                if (nextAxisTranslate !== prevAxisTranslate) {
                    (prevAxisTranslate ? transAxis : axis).attr('transform', utilsDraw.translate(...position));
                }
                transAxis.call(axisScale);
                transAxis.attr('opacity', 1);

                var isHorizontal = (utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h');
                var prettifyTick = (scale.scaleType === 'ordinal' || scale.scaleType === 'period');
                if (prettifyTick && !scale.guide.hideTicks) {
                    d3_decorator_prettify_categorical_axis_ticks(
                        transAxis,
                        scale,
                        isHorizontal,
                        animationSpeed
                    );
                }

                d3_decorator_wrap_tick_label(axis, animationSpeed, scale.guide, isHorizontal, scale);

                if (!scale.guide.label.hide) {
                    d3_decorator_prettify_axis_label(
                        axis,
                        scale.guide.label,
                        isHorizontal,
                        size,
                        animationSpeed
                    );
                }

                if (scale.guide.hideTicks) {
                    axis.selectAll('.tick').remove();
                    return;
                }

                var activeTicks = scale.scaleObj.ticks ? scale.scaleObj.ticks() : scale.scaleObj.domain();
                var fixAxesCollision = function () {
                    if (prettifyTick && scale.guide.avoidCollisions) {
                        d3_decorator_avoid_labels_collisions(axis, isHorizontal, activeTicks);
                    }

                    if (isHorizontal && (scale.scaleType === 'time')) {
                        d3_decorator_fix_horizontal_axis_ticks_overflow(axis, activeTicks);
                    }
                };
                fixAxesCollision();
                // NOTE: As far as floating axes transition overrides current,
                // transition `end` event cannot be used. So using `setTimeout`.
                // transAxis.onTransitionEnd(fixAxesCollision);
                var timeoutField = '_transitionEndTimeout_' + (isHorizontal ? 'h' : 'v');
                clearTimeout(this[timeoutField]);
                if (animationSpeed > 0) {
                    this[timeoutField] = setTimeout(fixAxesCollision, animationSpeed);
                }
            });
    }

    _removeDimAxis(container, scale) {
        var axis = selectAllImmediate(container, this._getAxisSelector(scale))
            .classed('tau-active', false);
        transition(axis, this.config.guide.animationSpeed, 'axisTransition')
            .attr('opacity', 1e-6)
            .remove();
    }

    _getAxisSelector(scale) {
        var isHorizontal = (utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h');
        return `g.${isHorizontal ? 'x' : 'y'}.axis`;
    }

    _drawGrid(container, node, width, height) {

        var grid = selectOrAppend(container, `g.grid`)
            .attr('transform', utilsDraw.translate(0, 0))
            .call((selection) => {

                var grid = selection;

                var animationSpeed = this.config.guide.animationSpeed;

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
                            xGridAxis.ticks(calcTicks(width / xScale.guide.density));
                            xGridAxis.tickFormat(formatter);
                        }

                        var xGridLines = selectOrAppend(gridLines, 'g.grid-lines-x');
                        var xGridLinesTrans = transition(xGridLines, animationSpeed)
                            .call(xGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (xScale.scaleType === 'ordinal' || xScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(
                                xGridLinesTrans,
                                xScale,
                                isHorizontal,
                                animationSpeed
                            );
                        }

                        let extraGridLines = selectOrAppend(gridLines, 'g.tau-extraGridLines');
                        d3_decorator_fix_axis_start_line(
                            extraGridLines,
                            isHorizontal,
                            width,
                            height,
                            animationSpeed
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
                            yGridAxis.ticks(calcTicks(height / yScale.guide.density));
                            yGridAxis.tickFormat(formatter);
                        }

                        var yGridLines = selectOrAppend(gridLines, 'g.grid-lines-y');
                        var yGridLinesTrans = transition(yGridLines, animationSpeed)
                            .call(yGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (yScale.scaleType === 'ordinal' || yScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(
                                yGridLinesTrans,
                                yScale,
                                isHorizontal,
                                animationSpeed
                            );
                        }

                        let fixLineScales = ['time', 'ordinal', 'period'];
                        let fixBottomLine = fixLineScales.indexOf(yScale.scaleType) !== -1;
                        if (fixBottomLine) {
                            let extraGridLines = selectOrAppend(gridLines, 'g.tau-extraGridLines');
                            d3_decorator_fix_axis_start_line(
                                extraGridLines,
                                isHorizontal,
                                width,
                                height,
                                animationSpeed
                            );
                        }
                    }

                    gridLines.selectAll('text').remove();
                }
            });

        return grid;
    }
}