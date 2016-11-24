import {CSS_PREFIX} from '../const';
import {GrammarRegistry} from '../grammar-registry';
import {LayerLabels} from './decorators/layer-labels';
import {d3_transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';

const Point = {

    init(xConfig) {

        const config = Object.assign({}, xConfig);

        config.guide = utils.defaults(
            (config.guide || {}),
            {
                animationSpeed: 0,
                prettify: true,
                enableColorToBarPosition: false
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
                const isEmptySize = !prevModel.scaleSize.dim; // TODO: empty method for size scale???
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
            })
        ].filter(x => x);

        return config;
    },

    addInteraction() {
        const node = this.node();
        node.on('highlight', (sender, e) => this.highlight(e));
        node.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        const getHighlightEvtObj = (e, data) => {
            const filter = ((d) => d === data ? true : null);
            filter.data = data;
            filter.domEvent = e;
            return filter;
        };
        const activate = ((sender, e) => sender.fire('highlight-data-points', getHighlightEvtObj(e.event, e.data)));
        const deactivate = ((sender, e) => sender.fire('highlight-data-points', getHighlightEvtObj(e.event, null)));
        node.on('mouseover', activate);
        node.on('mousemove', activate);
        node.on('mouseout', deactivate);
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
    },

    highlightDataPoints(filter) {
        this.highlight(filter);

        // Add highlighted elements to event.
        filter.targetElements = [];
        this.node().config.options.container
            .selectAll('.dot')
            .filter(filter)
            .each(function () {
                filter.targetElements.push(this);
            });
    }
};

export {Point};