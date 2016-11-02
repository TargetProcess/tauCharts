import {CSS_PREFIX} from '../const';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

const Interval = {

    init(xConfig) {

        var config = Object.assign({}, xConfig);

        config.guide = (config.guide || {});
        config.guide = utils.defaults(
            (config.guide),
            {
                animationSpeed: 0,
                prettify: true,
                enableColorToBarPosition: !config.stack
            });

        config.guide.size = utils.defaults(
            (config.guide.size || {}),
            {
                enableDistributeEvenly: true
            });

        config.guide.label = utils.defaults(
            (config.guide.label || {}),
            {
                position: (config.flip ?
                        ['r-', 'l+', 'hide-by-label-height-horizontal', 'cut-label-horizontal'] :
                        (config.stack ?
                                [
                                    'rotate-on-size-overflow',
                                    't-',
                                    'b+',
                                    'hide-by-label-height-vertical',
                                    'cut-label-vertical',
                                    'auto:hide-on-label-label-overlap'
                                ] :
                                [
                                    'rotate-on-size-overflow',
                                    't+',
                                    'b-',
                                    'hide-by-label-height-vertical',
                                    'cut-label-vertical',
                                    'auto:hide-on-label-label-overlap'
                                ]
                        )
                )
            });

        var enableColorPositioning = config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = config.guide.size.enableDistributeEvenly;

        config.transformRules = [
            config.flip && CartesianGrammar.decorator_flip,
            CartesianGrammar.decorator_groupOrderByColor,
            config.stack && CartesianGrammar.decorator_stack,
            enableColorPositioning && CartesianGrammar.decorator_positioningByColor
        ]
            .filter(x => x)
            .concat(config.transformModel || []);

        config.adjustRules = [
            (enableDistributeEvenly && ((prevModel, args) => {
                const sizeCfg = utils.defaults(
                    (config.guide.size || {}),
                    {
                        defMinSize: config.guide.prettify ? 3 : 0,
                        defMaxSize: config.guide.prettify ? 40 : Number.MAX_VALUE
                    });
                const params = Object.assign(
                    {},
                    args,
                    {
                        defMin: sizeCfg.defMinSize,
                        defMax: sizeCfg.defMaxSize,
                        minLimit: sizeCfg.minSize,
                        maxLimit: sizeCfg.maxSize
                    });

                return CartesianGrammar.decorator_size_distribute_evenly(prevModel, params);
            })),
            (enableDistributeEvenly && config.guide.prettify && CartesianGrammar.avoidBaseScaleOverflow),
            (config.stack && CartesianGrammar.adjustYScale)
        ].filter(x => x);

        return config;
    },

    addInteraction() {
        var node = this.node();
        node.on('highlight', (sender, e) => this.highlight(e));
        node.on('mouseover', ((sender, e) => {
            const identity = sender.screenModel.model.id;
            const id = identity(e.data);
            sender.fire('highlight', ((row) => (identity(row) === id) ? true : null));
        }));
        node.on('mouseout', ((sender) => sender.fire('highlight', () => null)));
    },

    draw() {
        var self = this;
        var config = this.node().config;

        var options = config.options;
        // TODO: hide it somewhere
        options.container = options.slot(config.uid);

        var prettify = config.guide.prettify;
        var baseCssClass = `i-role-element i-role-datum bar ${CSS_PREFIX}bar`;

        var screenModel = this.node().screenModel;

        var d3Attrs = this.buildModel(screenModel, {prettify, minBarH: 1, minBarW: 1, baseCssClass});

        var createUpdateFunc = d3_animationInterceptor;

        var barX = config.flip ? 'y' : 'x';
        var barY = config.flip ? 'x' : 'y';
        var barH = config.flip ? 'width' : 'height';
        var barW = config.flip ? 'height' : 'width';
        var updateBarContainer = function () {
            this.attr('class', 'frame i-role-bar-group');
            var bars = this.selectAll('.bar')
                .data((fiber) => fiber, screenModel.id);
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
                    {[barY]: screenModel[`${barY}0`], [barH]: 0},
                    d3Attrs
                ));

            self.node().subscribe(bars);
        };

        var data = this.node().data();

        var fibers = CartesianGrammar.toFibers(data, screenModel.model);

        var elements = options
            .container
            .selectAll('.frame')
            .data(fibers, (d) => screenModel.model.group(d[0]));
        elements
            .exit()
            .remove();
        elements
            .call(updateBarContainer);
        elements
            .enter()
            .append('g')
            .call(updateBarContainer);

        self.node().subscribe(new LayerLabels(screenModel.model, screenModel.model.flip, config.guide.label, options)
            .draw(fibers));
    },

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
        return Object.assign(
            model,
            {
                class: ((d) => `${baseCssClass} ${screenModel.class(d)}`),
                fill: ((d) => screenModel.color(d))
            });
    },

    highlight(filter) {

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        const container = this.node().config.options.container;
        const classed = {
            [x]: ((d) => filter(d) === true),
            [_]: ((d) => filter(d) === false)
        };

        container
            .selectAll('.bar')
            .classed(classed);

        container
            .selectAll('.i-role-label')
            .classed(classed);
    }
};

export {Interval};