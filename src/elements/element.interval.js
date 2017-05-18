import {CSS_PREFIX} from '../const';
import {GrammarRegistry} from '../grammar-registry';
import {LayerLabels} from './decorators/layer-labels';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
import d3 from 'd3';

const d3Data = ((node) => d3.select(node).data()[0]);

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
                sortByBarHeight: true,
                enableColorToBarPosition: (config.guide.enableColorToBarPosition != null ?
                    config.guide.enableColorToBarPosition :
                    !config.stack)
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
            .filter(x => x);

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

        const fibers = screenModel.toFibers();
        const data = fibers
            .reduce((arr, f) => arr.concat(f), []);

        const barClass = d3Attrs.class;
        const updateAttrs = utils.omit(d3Attrs, 'class');
        const bars = options.container.selectAll('.bar')
            .data(data, screenModel.id);
        bars.exit()
            .classed('tau-removing', true)
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
                        return this.getAttribute('data-zero');
                    },
                    [barW]: 0,
                    [barH]: 0
                },
                // ((node) => d3.select(node).remove())
                ((node) => {
                    // NOTE: Sometimes nodes are removed after
                    // they re-appear by filter.
                    var el = d3.select(node);
                    if (el.classed('tau-removing')) {
                        el.remove();
                    }
                })
            ));
        bars.call(createUpdateFunc(
            config.guide.animationSpeed,
            null,
            updateAttrs
        )).attr('class', barClass)
            .attr('data-zero', screenModel[`${barY}0`]);
        bars.enter()
            .append('rect')
            .call(createUpdateFunc(
                config.guide.animationSpeed,
                {[barY]: screenModel[`${barY}0`], [barH]: 0},
                updateAttrs
            )).attr('class', barClass)
            .attr('data-zero', screenModel[`${barY}0`]);

        node.subscribe(new LayerLabels(screenModel.model, screenModel.model.flip, config.guide.label, options)
            .draw(fibers));

        const sortByWidthThenY = ((a, b) => {
            const dataA = d3Data(a);
            const dataB = d3Data(b);
            const widthA = d3Attrs.width(dataA);
            const widthB = d3Attrs.width(dataB);
            if (widthA === widthB) {
                const yA = d3Attrs.y(dataA);
                const yB = d3Attrs.y(dataB);
                if (yA === yB) {
                    return sortByOrder(a, b);
                }
                return (yA - yB);
            }
            return (widthB - widthA);
        });
        const sortByHeightThenX = ((a, b) => {
            const dataA = d3Data(a);
            const dataB = d3Data(b);
            const heightA = d3Attrs.height(dataA);
            const heightB = d3Attrs.height(dataB);
            if (heightA === heightB) {
                const xA = d3Attrs.x(dataA);
                const xB = d3Attrs.x(dataB);
                if (xA === xB) {
                    return sortByOrder(a, b);
                }
                return (xA - xB);
            }
            return (heightB - heightA);
        });
        const sortByOrder = (() => {
            const order = data.reduce((map, d, i) => {
                map.set(d, i + 1);
                return map;
            }, new Map());
            return (a, b) => {
                const orderA = (order.get(d3Data(a)) || -1);
                const orderB = (order.get(d3Data(b)) || -1);
                return (orderA - orderB);
            };
        })();

        this._barsSorter = (config.guide.sortByBarHeight ?
            (config.flip ?
                sortByWidthThenY :
                sortByHeightThenX) :
            sortByOrder
        );

        const elementsOrder = {
            rect: 0,
            text: 1
        };
        this._typeSorter = ((a, b) => elementsOrder[a.tagName] - elementsOrder[b.tagName]);

        this._sortElements(this._typeSorter, this._barsSorter);

        node.subscribe(bars);

        this._boundsInfo = this._getBoundsInfo(bars[0]);
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

    _sortElements(...sorters) {
        const container = this.node().config.options.container.node();
        utilsDom.sortChildren(container, utils.createMultiSorter(...sorters));
    },

    _getBoundsInfo(bars) {
        if (bars.length === 0) {
            return null;
        }

        const screenModel = this.node().screenModel;
        const {flip} = this.node().config;

        const items = bars
            .map((node) => {
                const data = d3.select(node).data()[0];
                const x = screenModel.x(data);
                const x0 = screenModel.x0(data);
                const y = screenModel.y(data);
                const y0 = screenModel.y0(data);
                const w = Math.abs(x - x0);
                const h = Math.abs(y - y0);
                const cx = ((x + x0) / 2);
                const cy = ((y + y0) / 2);
                const invert = (y > y0);

                const box = {
                    top: (cy - h / 2),
                    right: (cx + w / 2),
                    bottom: (cy + h / 2),
                    left: (cx - w / 2)
                };

                return {node, data, cx, cy, box, invert};
            });

        const bounds = items.reduce(
            (bounds, {box}) => {
                bounds.left = Math.min(box.left, bounds.left);
                bounds.right = Math.max(box.right, bounds.right);
                bounds.top = Math.min(box.top, bounds.top);
                bounds.bottom = Math.max(box.bottom, bounds.bottom);
                return bounds;
            }, {
                left: Number.MAX_VALUE,
                right: Number.MIN_VALUE,
                top: Number.MAX_VALUE,
                bottom: Number.MIN_VALUE
            });

        const ticks = utils.unique(items.map(flip ?
            ((item) => item.cy) :
            ((item) => item.cx))).sort((a, b) => a - b);
        const groups = ticks.reduce(((obj, value) => (obj[value] = [], obj)), {});
        items.forEach((item) => {
            const tick = ticks.find(flip ? ((value) => item.cy === value) : ((value) => item.cx === value));
            groups[tick].push(item);
        });
        const split = (values) => {
            if (values.length === 1) {
                return groups[values];
            }
            const midIndex = Math.ceil(values.length / 2);
            const middle = (values[midIndex - 1] + values[midIndex]) / 2;
            return {
                middle,
                lower: split(values.slice(0, midIndex)),
                greater: split(values.slice(midIndex))
            };
        };
        const tree = split(ticks);

        return {bounds, tree};
    },

    getClosestElement(_cursorX, _cursorY) {
        if (!this._boundsInfo) {
            return null;
        }
        const {bounds, tree} = this._boundsInfo;
        const container = this.node().config.options.container;
        const {flip} = this.node().config;
        const translate = utilsDraw.getDeepTransformTranslate(container.node());
        const cursorX = (_cursorX - translate.x);
        const cursorY = (_cursorY - translate.y);
        const {maxHighlightDistance} = this.node().config.guide;
        if ((cursorX < bounds.left - maxHighlightDistance) ||
            (cursorX > bounds.right + maxHighlightDistance) ||
            (cursorY < bounds.top - maxHighlightDistance) ||
            (cursorY > bounds.bottom + maxHighlightDistance)
        ) {
            return null;
        }

        const measureCursor = (flip ? cursorY : cursorX);
        const valueCursor = (flip ? cursorX : cursorY);
        const isBetween = ((value, start, end) => value >= start && value <= end);
        const closestElements = (function getClosestElements(el) {
            if (Array.isArray(el)) {
                return el;
            }
            return getClosestElements(measureCursor > el.middle ? el.greater : el.lower);
        })(tree)
            .map((el) => {
                const elStart = (flip ? el.box.left : el.box.top);
                const elEnd = (flip ? el.box.right : el.box.bottom);
                const cursorInside = isBetween(valueCursor, elStart, elEnd);
                if (!cursorInside &&
                    (Math.abs(valueCursor - elStart) > maxHighlightDistance) &&
                    (Math.abs(valueCursor - elEnd) > maxHighlightDistance)
                ) {
                    return null;
                }
                const distToValue = Math.abs(valueCursor - ((el.invert !== flip) ? elEnd : elStart));
                return Object.assign(el, {distToValue, cursorInside});
            })
            .filter((el) => el)
            .sort(((a, b) => {
                if (a.cursorInside !== b.cursorInside) {
                    return (b.cursorInside - a.cursorInside);
                }
                return (Math.abs(a.distToValue) - Math.abs(b.distToValue));
            }))
            .map((el) => {
                const x = (el.cx);
                const y = (el.cy);
                const distance = Math.abs(flip ? (cursorY - y) : (cursorX - x));
                const secondaryDistance = Math.abs(flip ? (cursorX - x) : (cursorY - y));
                return {node: el.node, data: el.data, distance, secondaryDistance, x, y};
            });

        return (closestElements[0] || null);
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

        this._sortElements(
            (a, b) => (filter(d3Data(a)) - filter(d3Data(b))),
            this._typeSorter,
            this._barsSorter
        );
    }
};

export {Interval};