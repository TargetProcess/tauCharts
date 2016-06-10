import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {default as _} from 'underscore';

export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        var enableStack = this.config.stack;
        this.config.guide = (this.config.guide || {});
        this.config.guide = _.defaults(
            (this.config.guide),
            {
                prettify: true,
                enableColorToBarPosition: !enableStack
            });

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                enableDistributeEvenly: true,
                defMinSize: this.config.guide.prettify ? 3 : 0,
                defMaxSize: this.config.guide.prettify ? 40 : Number.MAX_VALUE
            });

        this.config.guide.label = _.defaults(
            (this.config.guide.label || {}),
            {
                position: (this.config.flip ?
                    ['r-', 'l+', 'keep-inside-or-hide-horizontal'] :
                    (enableStack ?
                        ['t-', 'b+', 'keep-inside-or-hide-vertical'] :
                        ['t+', 'b-', 'keep-inside-or-hide-vertical']))
            });

        this.baseCssClass = `i-role-element i-role-datum bar ${CSS_PREFIX}bar`;

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = this.config.guide.size.enableDistributeEvenly;

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            CartesianGrammar.decorator_groupOrderByColor,
            enableStack && CartesianGrammar.decorator_stack,
            enableColorPositioning && CartesianGrammar.decorator_positioningByColor,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && enableDistributeEvenly && CartesianGrammar.decorator_size_distribute_evenly,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.size = fnCreateScale('size', config.size, {});
        this.color = fnCreateScale('color', config.color, {});
        this.split = fnCreateScale('split', config.split, {});
        this.label = fnCreateScale('label', config.label, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('split', this.split)
            .regScale('label', this.label);
    }

    walkFrames(frames) {

        var args = {
            isHorizontal: this.config.flip,
            minLimit: this.minLimit,
            maxLimit: this.maxLimit,
            defMin: this.defMin,
            defMax: this.defMax,
            dataSource: this.convertFramesToData(frames)
        };

        return this
            .decorators
            .filter(x => x)
            .reduce(((model, transform) => transform(model, args)), (new CartesianGrammar({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleSize: this.size,
                scaleLabel: this.label,
                scaleColor: this.color,
                scaleSplit: this.split
            })));
    }

    convertFramesToData(frames) {
        return frames.reduce(((memo, f) => memo.concat(f.part())), []);
    }

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;
        var uid = options.uid;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var prettify = config.guide.prettify;
        var baseCssClass = this.baseCssClass;

        var modelGoG = this.walkFrames(frames);
        var barModel = this.buildModel(modelGoG, {colorScale});

        var params = {prettify, xScale, yScale, minBarH: 1, minBarW: 1, baseCssClass};
        var d3Attrs = (config.flip ?
            this.toHorizontalDrawMethod(barModel, params) :
            this.toVerticalDrawMethod(barModel, params));

        var updateBar = function () {
            return this.attr(d3Attrs);
        };

        var updateBarContainer = function () {
            this.attr('class', `frame-id-${uid} i-role-bar-group`);
            var bars = this.selectAll('.bar').data((fiber) => fiber);
            bars.exit()
                .remove();
            bars.call(updateBar);
            bars.enter()
                .append('rect')
                .call(updateBar);

            self.subscribe(bars);
        };

        var data = this.convertFramesToData(frames);

        var fibers = CartesianGrammar.toFibers(data, modelGoG);

        var elements = options
            .container
            .selectAll(`.frame-id-${uid}`)
            .data(fibers);
        elements
            .exit()
            .remove();
        elements
            .call(updateBarContainer);
        elements
            .enter()
            .append('g')
            .call(updateBarContainer);

        self.subscribe(new LayerLabels(modelGoG, config.flip, config.guide.label, options).draw(fibers));
    }

    toVerticalDrawMethod(
        {barX, barY, barH, barW, barColor, barClass},
        {prettify, minBarH, minBarW, yScale, baseCssClass}) {

        var calculateW = ((d) => {
            var w = barW(d);
            if (prettify) {
                w = Math.max(minBarW, w);
            }
            return w;
        });

        return {
            x: ((d) => barX(d) - calculateW(d) * 0.5),
            y: ((d) => {
                var y = barY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = barH(d);
                    var isTooSmall = (h < minBarH);
                    return ((isTooSmall && (d[yScale.dim] > 0)) ? (y - minBarH) : y);
                } else {
                    return y;
                }
            }),
            height: ((d) => {
                var h = barH(d);
                if (prettify) {
                    // decorate for better visual look & feel
                    var y = d[yScale.dim];
                    return (y === 0) ? h : Math.max(minBarH, h);
                } else {
                    return h;
                }
            }),
            width: ((d) => calculateW(d)),
            class: ((d) => `${baseCssClass} ${barClass(d)}`),
            fill: ((d) => barColor(d))
        };
    }

    toHorizontalDrawMethod(
        {barX, barY, barH, barW, barColor, barClass},
        {prettify, minBarH, minBarW, xScale, baseCssClass}) {

        var calculateH = ((d) => {
            var h = barW(d);
            if (prettify) {
                h = Math.max(minBarW, h);
            }
            return h;
        });

        return {
            y: ((d) => barX(d) - calculateH(d) * 0.5),
            x: ((d) => {
                var x = barY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = barH(d);
                    var dx = d[xScale.dim];
                    var offset = 0;

                    if (dx === 0) {offset = 0;}
                    if (dx > 0) {offset = (h);}
                    if (dx < 0) {offset = (0 - minBarH);}

                    var isTooSmall = (h < minBarH);
                    return (isTooSmall) ? (x + offset) : (x);
                } else {
                    return x;
                }
            }),
            height: ((d) => calculateH(d)),
            width: ((d) => {
                var w = barH(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var x = d[xScale.dim];
                    return (x === 0) ? w : Math.max(minBarH, w);
                } else {
                    return w;
                }
            }),
            class: ((d) => `${baseCssClass} ${barClass(d)}`),
            fill: ((d) => barColor(d))
        };
    }

    buildModel(modelGoG, {colorScale}) {

        return {
            barX: ((d) => modelGoG.xi(d)),
            barY: ((d) => Math.min(modelGoG.y0(d), modelGoG.yi(d))),
            barH: ((d) => Math.abs(modelGoG.yi(d) - modelGoG.y0(d))),
            barW: ((d) => modelGoG.size(d)),
            barColor: ((d) => colorScale.toColor(modelGoG.color(d))),
            barClass: ((d) => colorScale.toClass(modelGoG.color(d))),
            group: ((d) => modelGoG.group(d)),
            order: ((d) => modelGoG.order(d))
        };
    }

    highlight(filter) {

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        var container = this.config.options.container;

        container
            .selectAll('.bar')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });

        container
            .selectAll('.i-role-label')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });
    }
}