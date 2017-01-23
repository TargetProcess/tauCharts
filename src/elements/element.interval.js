import {CSS_PREFIX} from '../const';
import {GrammarRegistry} from '../grammar-registry';
import {LayerLabels} from './decorators/layer-labels';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
import d3 from 'd3';

const Interval = {

    init(xConfig) {

        const config = Object.assign({}, xConfig);

        config.guide = (config.guide || {});
        config.guide = utils.defaults(
            (config.guide),
            {
                animationSpeed: 0,
                avoidScalesOverflow: true,
                maxHighlightDistance: 32,
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
                    (config.stack ?
                        [
                            'r-',
                            'l+',
                            'hide-by-label-height-horizontal',
                            'cut-label-horizontal'
                        ] :
                        [
                            'outside-then-inside-horizontal',
                            'auto:hide-on-label-label-overlap'
                        ]
                    ) :
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
                                    'outside-then-inside-vertical',
                                    'auto:hide-on-label-label-overlap'
                                ]
                        )
                )
            });

        const avoidScalesOverflow = config.guide.avoidScalesOverflow;
        const enableColorPositioning = config.guide.enableColorToBarPosition;
        const enableDistributeEvenly = config.guide.size.enableDistributeEvenly;

        config.transformRules = [
            config.flip && GrammarRegistry.get('flip'),
            config.stack && GrammarRegistry.get('stack'),
            enableColorPositioning && GrammarRegistry.get('positioningByColor')
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

                return GrammarRegistry.get('size_distribute_evenly')(prevModel, params);
            })),
            (
                avoidScalesOverflow &&
                enableDistributeEvenly &&
                ((prevModel, args) => {
                    const params = Object.assign({}, args, {
                        sizeDirection: 'x'
                    });
                    return GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
                })
            ),
            (config.stack && GrammarRegistry.get('adjustYScale'))
        ].filter(x => x);

        return config;
    },

    addInteraction() {
        const node = this.node();
        const createFilter = ((data, falsy) => ((row) => row === data ? true : falsy));
        node.on('highlight', (sender, filter) => this.highlight(filter));
        node.on('data-hover', ((sender, e) => this.highlight(createFilter(e.data, null))));
        node.on('data-click', ((sender, e) => this.highlight(createFilter(e.data, e.data ? false : null))));
    },

    draw() {
        const node = this.node();
        const config = node.config;
        const options = config.options;
        // TODO: hide it somewhere
        options.container = options.slot(config.uid);

        const prettify = config.guide.prettify;
        const baseCssClass = `i-role-element i-role-datum bar ${CSS_PREFIX}bar`;
        const screenModel = node.screenModel;
        const d3Attrs = this.buildModel(screenModel, {prettify, minBarH: 1, minBarW: 1, baseCssClass});
        const createUpdateFunc = d3_animationInterceptor;

        const barX = config.flip ? 'y' : 'x';
        const barY = config.flip ? 'x' : 'y';
        const barH = config.flip ? 'width' : 'height';
        const barW = config.flip ? 'height' : 'width';
        const updateBarContainer = function () {
            this.attr('class', 'frame i-role-bar-group');
            const barClass = d3Attrs.class;
            var updateAttrs = utils.omit(d3Attrs, 'class');
            const bars = this.selectAll('.bar')
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
                updateAttrs
            )).attr('class', barClass);
            bars.enter()
                .append('rect')
                .call(createUpdateFunc(
                    config.guide.animationSpeed,
                    {[barY]: screenModel[`${barY}0`], [barH]: 0},
                    updateAttrs
                )).attr('class', barClass);

            node.subscribe(bars);
        };

        const fibers = screenModel.toFibers();

        const elements = options
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

        node.subscribe(new LayerLabels(screenModel.model, screenModel.model.flip, config.guide.label, options)
            .draw(fibers));

        // Put labels after bars
        const container = options.container.node();
        const children = Array.prototype.slice.call(container.childNodes, 0);
        const lastBarIndex = (children.length - 1 - children.slice(0).reverse()
            .findIndex((el) => el.matches('.i-role-bar-group')));
        const afterBar = container.childNodes.item(lastBarIndex + 1);
        children.slice(0, lastBarIndex)
            .filter((el) => el.matches('.i-role-label'))
            .forEach((el) => container.insertBefore(el, afterBar));
    },

    buildModel(screenModel, {prettify, minBarH, minBarW, baseCssClass}) {

        const barSize = ((d) => {
            var w = screenModel.size(d);
            if (prettify) {
                w = Math.max(minBarW, w);
            }
            return w;
        });

        var model;
        const value = (d) => d[screenModel.model.scaleY.dim];
        if (screenModel.flip) {
            let barHeight = ((d) => Math.abs(screenModel.x(d) - screenModel.x0(d)));
            model = {
                y: ((d) => screenModel.y(d) - barSize(d) * 0.5),
                x: ((d) => {
                    const x = Math.min(screenModel.x0(d), screenModel.x(d));
                    if (prettify) {
                        // decorate for better visual look & feel
                        const h = barHeight(d);
                        const dx = value(d);
                        var offset = 0;

                        if (dx === 0) {offset = 0;}
                        if (dx > 0) {offset = (h);}
                        if (dx < 0) {offset = (0 - minBarH);}

                        const isTooSmall = (h < minBarH);
                        return (isTooSmall) ? (x + offset) : (x);
                    } else {
                        return x;
                    }
                }),
                height: ((d) => barSize(d)),
                width: ((d) => {
                    const h = barHeight(d);
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
                        const h = barHeight(d);
                        const isTooSmall = (h < minBarH);
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

    getClosestElement(cursorX, cursorY) {
        const container = this.node().config.options.container;
        const screenModel = this.node().screenModel;
        const {flip} = this.node().config;
        const {maxHighlightDistance} = this.node().config.guide;

        const bars = container.selectAll('.bar');
        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        const items = bars[0]
            .map((node) => {
                const data = d3.select(node).data()[0];
                const translate = utilsDraw.getDeepTransformTranslate(node);
                const x = screenModel.x(data);
                const x0 = screenModel.x0(data);
                const y = screenModel.y(data);
                const y0 = screenModel.y0(data);
                const w = Math.abs(x - x0);
                const h = Math.abs(y - y0);
                const cx = ((x + x0) / 2 + translate.x);
                const cy = ((y + y0) / 2 + translate.y);
                const distance = Math.abs(flip ? (cy - cursorY) : (cx - cursorX));
                const secondaryDistance = Math.abs(flip ? (cx - cursorX) : (cy - cursorY));
                minX = Math.min(cx - w / 2, minX);
                maxX = Math.max(cx + w / 2, maxX);
                minY = Math.min(cy - h / 2, minY);
                maxY = Math.max(cy + h / 2, maxY);
                return {node, data, distance, secondaryDistance, x: cx, y: cy};
            })
            .sort((a, b) => (a.distance === b.distance ?
                (a.secondaryDistance - b.secondaryDistance) :
                (a.distance - b.distance)
            ));

        if ((items.length === 0) ||
            (cursorX < minX - maxHighlightDistance) ||
            (cursorX > maxX + maxHighlightDistance) ||
            (cursorY < minY - maxHighlightDistance) ||
            (cursorY > maxY + maxHighlightDistance)
        ) {
            return null;
        }

        return items[0];
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

        utilsDraw.raiseElements(container, '.bar', filter);
        utilsDraw.raiseElements(container, '.frame', (fiber) => fiber.some(filter));
    }
};

export {Interval};