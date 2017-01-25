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

    getClosestElement(x0, y0) {
        const container = this.node().config.options.container;
        const screenModel = this.node().screenModel;
        const getDistance = ((x, y) => Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)));
        const {maxHighlightDistance} = this.node().config.guide;

        const dots = container.selectAll('.dot');
        const items = dots[0]
            .map((node) => {
                const data = d3.select(node).data()[0];
                const translate = utilsDraw.getDeepTransformTranslate(node);
                const x = (screenModel.x(data) + translate.x);
                const y = (screenModel.y(data) + translate.y);
                const r = (screenModel.size(data) / 2);
                const distance = getDistance(x, y);
                const secondaryDistance = (distance < r ? r - distance : distance);
                if (distance > r && distance > maxHighlightDistance) {
                    return null;
                }
                return {node, data, distance, secondaryDistance, x, y};
            })
            .filter((d) => d && !isNaN(d.x) && !isNaN(d.y))
            .sort((a, b) => (a.distance === b.distance ?
                (a.secondaryDistance - b.secondaryDistance) :
                (a.distance - b.distance)
            ));

        if (items.length === 0) {
            return null;
        }

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
        const angle = (Math.atan2(my - y0, mx - x0) + Math.PI);
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