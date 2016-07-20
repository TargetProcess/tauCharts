import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        var enableStack = this.config.stack;
        this.config.guide = (this.config.guide || {});
        this.config.guide = _.defaults(
            (this.config.guide),
            {
                animationSpeed: 0,
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
                        [
                            'rotate-on-size-overflow',
                            't-',
                            'b+',
                            'keep-inside-or-hide-vertical',
                            'auto:hide-on-label-label-overlap'
                        ] :
                        [
                            'rotate-on-size-overflow',
                            't+',
                            'b-',
                            'keep-inside-or-hide-vertical',
                            'auto:hide-on-label-label-overlap'
                        ]
                    )
                )
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
        ].concat(config.transformModel || []);

        this.on('highlight', (sender, e) => this.highlight(e));

        this._createScales(config.fnCreateScale);
    }

    _createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.size = fnCreateScale('size', config.size, {});
        this.color = fnCreateScale('color', config.color, {});
        this.split = fnCreateScale('split', config.split, {});
        this.label = fnCreateScale('label', config.label, {});
        this.identity = fnCreateScale('identity', config.identity, {});

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
            .reduce(((model, transform) => CartesianGrammar.compose(model, transform(model, args))),
            (new CartesianGrammar({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleSize: this.size,
                scaleLabel: this.label,
                scaleColor: this.color,
                scaleSplit: this.split,
                scaleIdentity: this.identity
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
        var prettify = config.guide.prettify;
        var baseCssClass = this.baseCssClass;

        var modelGoG = this.walkFrames(frames);
        self.screenModel = modelGoG.toScreenModel();
        var d3Attrs = this.buildModel(self.screenModel, {prettify, minBarH: 1, minBarW: 1, baseCssClass});

        var createUpdateFunc = d3_animationInterceptor;

        var barX = config.flip ? 'y' : 'x';
        var barY = config.flip ? 'x' : 'y';
        var barH = config.flip ? 'width' : 'height';
        var barW = config.flip ? 'height' : 'width';
        var updateBarContainer = function () {
            this.attr('class', `frame-id-${uid} i-role-bar-group`);
            var bars = this.selectAll('.bar')
                .data((fiber) => fiber, self.screenModel.id);
            bars.exit()
                .call(createUpdateFunc(
                    config.guide.animationSpeed,
                    null,
                    {
                        [barX]: function () {
                            var d3This = d3.select(this);
                            var x = d3This.attr(barX) - 0;
                            var w = d3This.attr(barW) - 0;
                            return x + w / 2;
                        },
                        [barY]: function () {
                            var d3This = d3.select(this);
                            var y = d3This.attr(barY) - 0;
                            var h = d3This.attr(barH) - 0;
                            return y + h / 2;
                        },
                        [barW]: 0,
                        [barH]: 0
                    },
                    ((node) => d3.select(node).remove())
                ));
            bars.call(createUpdateFunc(
                config.guide.animationSpeed,
                null,
                d3Attrs
            ));
            bars.enter()
                .append('rect')
                .call(createUpdateFunc(
                    config.guide.animationSpeed,
                    {[barY]: self.screenModel[`${barY}0`], [barH]: 0},
                    d3Attrs
                ));

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

    buildModel(screenModel, {prettify, minBarH, minBarW, baseCssClass}) {

        var flip = screenModel.flip;

        var barSize = ((d) => {
            var w = screenModel.size(d);
            if (prettify) {
                w = Math.max(minBarW, w);
            }
            return w;
        });

        var model;
        var value = (d) => d[screenModel.model.scaleY.dim];
        if (flip) {
            let barHeight = ((d) => Math.abs(screenModel.x(d) - screenModel.x0(d)));
            model = {
                y: ((d) => screenModel.y(d) - barSize(d) * 0.5),
                x: ((d) => {
                    var x = Math.min(screenModel.x0(d), screenModel.x(d));
                    if (prettify) {
                        // decorate for better visual look & feel
                        var h = barHeight(d);
                        var dx = value(d);
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
                height: ((d) => barSize(d)),
                width: ((d) => {
                    var h = barHeight(d);
                    if (prettify) {
                        // decorate for better visual look & feel
                        return (value(d) === 0) ? h : Math.max(minBarH, h);
                    }
                    return h;
                })
            };
        } else {
            let barHeight = ((d) => Math.abs(screenModel.y(d) - screenModel.y0(d)));
            model = {
                x: ((d) => screenModel.x(d) - barSize(d) * 0.5),
                y: ((d) => {
                    var y = Math.min(screenModel.y0(d), screenModel.y(d));
                    if (prettify) {
                        // decorate for better visual look & feel
                        var h = barHeight(d);
                        var isTooSmall = (h < minBarH);
                        y = ((isTooSmall && (value(d) > 0)) ? (y - minBarH) : y);
                    }
                    return y;
                }),
                width: ((d) => barSize(d)),
                height: ((d) => {
                    var h = barHeight(d);
                    if (prettify) {
                        // decorate for better visual look & feel
                        h = ((value(d) === 0) ? h : Math.max(minBarH, h));
                    }
                    return h;
                })
            };
        }
        return _.extend(
            model,
            {
                class: ((d) => `${baseCssClass} ${screenModel.class(d)}`),
                fill: ((d) => screenModel.color(d))
            });
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