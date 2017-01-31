import {CSS_PREFIX} from '../const';
import {GrammarRegistry} from '../grammar-registry';
import {LayerLabels} from './decorators/layer-labels';
import {d3_transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
import d3 from 'd3';

const Point = {

    init(xConfig) {

        const config = Object.assign({}, xConfig);

        config.guide = utils.defaults(
            (config.guide || {}),
            {
                animationSpeed: 0,
                avoidScalesOverflow: true,
                enableColorToBarPosition: false,
                maxHighlightDistance: 32
            });

        config.guide.size = (config.guide.size || {});

        config.guide.label = utils.defaults(
            (config.guide.label || {}),
            {
                position: [
                    'auto:avoid-label-label-overlap',
                    'auto:avoid-label-anchor-overlap',
                    'auto:adjust-on-label-overflow',
                    'auto:hide-on-label-label-overlap',
                    'auto:hide-on-label-anchor-overlap'
                ]
            });

        const avoidScalesOverflow = config.guide.avoidScalesOverflow;
        const enableColorPositioning = config.guide.enableColorToBarPosition;

        config.transformRules = [
            ((prevModel) => {
                const bestBaseScale = [prevModel.scaleX, prevModel.scaleY]
                    .sort((a, b) => {
                        var discreteA = a.discrete ? 1 : 0;
                        var discreteB = b.discrete ? 1 : 0;
                        return (discreteB * b.domain().length) - (discreteA * a.domain().length);
                    })
                    [0];
                const isHorizontal = (prevModel.scaleY === bestBaseScale);
                return isHorizontal ?
                    GrammarRegistry.get('flip')(prevModel) :
                    GrammarRegistry.get('identity')(prevModel);
            }),
            config.stack && GrammarRegistry.get('stack'),
            enableColorPositioning && GrammarRegistry.get('positioningByColor')
        ]
            .filter(x => x)
            .concat(config.transformModel || []);

        config.adjustRules = [
            (config.stack && GrammarRegistry.get('adjustYScale')),
            ((prevModel, args) => {
                const isEmptySize = prevModel.scaleSize.isEmptyScale();
                const sizeCfg = utils.defaults(
                    (config.guide.size),
                    {
                        defMinSize: 10,
                        defMaxSize: isEmptySize ? 10 : 40,
                        enableDistributeEvenly: !isEmptySize
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

                const method = (sizeCfg.enableDistributeEvenly ?
                    GrammarRegistry.get('adjustSigmaSizeScale') :
                    GrammarRegistry.get('adjustStaticSizeScale'));

                return method(prevModel, params);
            }),
            (avoidScalesOverflow && ((prevModel, args) => {
                const params = Object.assign({}, args, {
                    sizeDirection: 'xy'
                });
                return GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
            }))
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

        const transition = (sel) => {
            return d3_transition(sel, config.guide.animationSpeed);
        };

        const prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;
        const screenModel = node.screenModel;
        const kRound = 10000;

        const circleAttrs = {
            fill: ((d) => screenModel.color(d)),
            class: ((d) => `${prefix} ${screenModel.class(d)}`)
        };

        const circleTransAttrs = {
            r: ((d) => (Math.round(kRound * screenModel.size(d) / 2) / kRound)),
            cx: ((d) => screenModel.x(d)),
            cy: ((d) => screenModel.y(d))
        };

        const updateGroups = function () {

            this.attr('class', 'frame')
                .call(function () {
                    var dots = this
                        .selectAll('circle')
                        .data((fiber) => fiber, screenModel.id);

                    transition(dots.enter().append('circle').attr(circleAttrs))
                        .attr(circleTransAttrs);

                    transition(dots.attr(circleAttrs))
                        .attr(circleTransAttrs);

                    transition(dots.exit())
                        .attr({r: 0})
                        .remove();

                    node.subscribe(dots);
                });

            transition(this)
                .attr('opacity', 1);
        };

        const fibers = screenModel.toFibers();

        const frameGroups = options
            .container
            .selectAll('.frame')
            .data(fibers, (f) => screenModel.group(f[0]));

        frameGroups
            .enter()
            .append('g')
            .attr('opacity', 0)
            .call(updateGroups);

        frameGroups
            .call(updateGroups);

        // TODO: Render bars into single container, exclude removed elements from calculation.
        this._boundsInfo = this._getBoundsInfo(options.container.selectAll('.dot')[0]);

        transition(frameGroups.exit())
            .attr('opacity', 0)
            .remove()
            .selectAll('circle')
            .attr('r', 0);

        node.subscribe(
            new LayerLabels(
                screenModel.model,
                screenModel.flip,
                config.guide.label,
                options
            ).draw(fibers)
        );
    },

    _getBoundsInfo(dots) {
        if (dots.length === 0) {
            return null;
        }

        const screenModel = this.node().screenModel;

        const items = dots
            .map((node) => {
                const data = d3.select(node).data()[0];
                const x = screenModel.x(data);
                const y = screenModel.y(data);
                const r = screenModel.size(data) / 2;

                return {node, data, x, y, r};
            })
            // TODO: Removed elements should not be passed to this function.
            .filter((item) => !isNaN(item.x) && !isNaN(item.y));

        const bounds = items.reduce(
            (bounds, {x, y}) => {
                bounds.left = Math.min(x, bounds.left);
                bounds.right = Math.max(x, bounds.right);
                bounds.top = Math.min(y, bounds.top);
                bounds.bottom = Math.max(y, bounds.bottom);
                return bounds;
            }, {
                left: Number.MAX_VALUE,
                right: Number.MIN_VALUE,
                top: Number.MAX_VALUE,
                bottom: Number.MIN_VALUE
            });

        // NOTE: There can be multiple items at the same point, but
        // D3 quad tree seems to ignore them.
        const coordinates = items.reduce((coordinates, item) => {
            const c = `${item.x},${item.y}`;
            if (!coordinates[c]) {
                coordinates[c] = [];
            }
            coordinates[c].push(item);
            return coordinates;
        }, {});

        const tree = d3.geom.quadtree()
            .x((d) => d[0].x)
            .y((d) => d[0].y)
            (Object.keys(coordinates).map((c) => coordinates[c]));

        return {bounds, tree};
    },

    getClosestElement(_cursorX, _cursorY) {
        if (!this._boundsInfo) {
            return null;
        }
        const {bounds, tree} = this._boundsInfo;
        const container = this.node().config.options.container;
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

        const items = (tree.find([cursorX, cursorY]) || [])
            .map((item) => {
                const distance = Math.sqrt(
                    Math.pow(cursorX - item.x, 2) +
                    Math.pow(cursorY - item.y, 2));
                if (distance > maxHighlightDistance) {
                    return null;
                }
                const secondaryDistance = (distance < item.r ? item.r - distance : distance);
                return {
                    node: item.node,
                    data: item.data,
                    x: item.x,
                    y: item.y,
                    distance,
                    secondaryDistance
                };
            })
            .filter((d) => d)
            .sort((a, b) => (a.secondaryDistance - b.secondaryDistance));

        const largerDistIndex = items.findIndex((d) => (
            (d.distance !== items[0].distance) ||
            (d.secondaryDistance !== items[0].secondaryDistance)
        ));
        const sameDistItems = (largerDistIndex < 0 ? items : items.slice(0, largerDistIndex));
        if (sameDistItems.length === 1) {
            return sameDistItems[0];
        }
        const mx = (sameDistItems.reduce((sum, item) => sum + item.x, 0) / sameDistItems.length);
        const my = (sameDistItems.reduce((sum, item) => sum + item.y, 0) / sameDistItems.length);
        const angle = (Math.atan2(my - cursorY, mx - cursorX) + Math.PI);
        const closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
        return closest;
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
            .selectAll('.dot')
            .classed(classed);

        container
            .selectAll('.i-role-label')
            .classed(classed);

        utilsDraw.raiseElements(container, '.dot', filter);
        utilsDraw.raiseElements(container, '.frame', (fiber) => fiber.some(filter));
    }
};

export {Point};