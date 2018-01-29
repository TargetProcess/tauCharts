import {Element} from './element';
import * as utilsDom from '../utils/utils-dom';
import * as utilsDraw from '../utils/utils-draw';
import * as utils from '../utils/utils';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {cartesianAxis, cartesianGrid} from './coords.cartesian.axis';
import {
    d3_transition as transition,
    d3_selectAllImmediate as selectAllImmediate,
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
            guide.x.hide = (guide.x.hide || (Math.floor(diff) > 0));
            guide.y.hide = (guide.y.hide || (Math.floor(unit.options.left) > 0));
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
        this.yScale = fnCreateScale(
            'pos',
            this.config.y,
            (scaleConfig) => ['ordinal', 'period'].indexOf(scaleConfig.type) >= 0 ? [0, h] : [h, 0]
        );
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
            .attr('class', (d) => `${CSS_PREFIX}cell cell uid_${d}`)
            .merge(xcells)
            .classed('tau-active', true);
        transition(xcells, this.config.guide.animationSpeed)
            .attr('opacity', 1);
        transition(xcells.exit().classed('tau-active', false), this.config.guide.animationSpeed)
            .attr('opacity', 1e-6)
            .remove();
    }

    _drawDimAxis(container, scale, position, size) {

        var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);

        var axisScale = cartesianAxis({
            scale: scale.scaleObj,
            scaleGuide: scale.guide,
            ticksCount: (formatter ? calcTicks(size / scale.guide.density) : null),
            tickFormat: (formatter || null)
        });

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
                        let formatter = FormatterRegistry.get(xScale.guide.tickFormat);
                        var xGridAxis = cartesianGrid({
                            scale: xScale.scaleObj,
                            scaleGuide: xScale.guide,
                            tickSize: height,
                            ticksCount: (formatter ? calcTicks(width / xScale.guide.density) : null)
                        });

                        var xGridLines = selectOrAppend(gridLines, 'g.grid-lines-x');
                        var xGridLinesTrans = transition(xGridLines, animationSpeed)
                            .call(xGridAxis);
                    }

                    if ((linesOptions.indexOf('y') > -1)) {
                        let yScale = node.y;
                        let formatter = FormatterRegistry.get(yScale.guide.tickFormat);
                        var yGridAxis = cartesianGrid({
                            scale: yScale.scaleObj,
                            scaleGuide: yScale.guide,
                            tickSize: -width,
                            ticksCount: (formatter ? calcTicks(height / yScale.guide.density) : null)
                        });

                        var yGridLines = selectOrAppend(gridLines, 'g.grid-lines-y');
                        var yGridLinesTrans = transition(yGridLines, animationSpeed)
                            .call(yGridAxis);
                    }
                }
            });

        return grid;
    }
}
