import {CSS_PREFIX} from '../const';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {d3_transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';

const Point = {

    setup(xConfig) {

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

        var enableColorPositioning = config.guide.enableColorToBarPosition;

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

                const baseScale = (isHorizontal ? prevModel.scaleY : prevModel.scaleX);
                const valsScale = (isHorizontal ? prevModel.scaleX : prevModel.scaleY);

                return {
                    flip: isHorizontal,
                    scaleX: baseScale,
                    scaleY: valsScale,
                    y0: ((d) => (valsScale.value(d[valsScale.dim]))),
                    yi: ((d) => (valsScale.value(d[valsScale.dim]))),
                    xi: ((d) => (baseScale.value(d[baseScale.dim])))
                };
            }),
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            config.stack && CartesianGrammar.decorator_stack,
            enableColorPositioning && CartesianGrammar.decorator_positioningByColor,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label
        ]
            .filter(x => x)
            .concat(config.transformModel || []);

        config.adjustRules = [
            (config.stack && CartesianGrammar.adjustYScale),
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
                    CartesianGrammar.adjustSigmaSizeScale :
                    CartesianGrammar.adjustStaticSizeScale);

                return method(prevModel, params);
            })
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

        var transition = (sel) => {
            return d3_transition(sel, config.guide.animationSpeed);
        };

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var fullData = this.node().data();

        const screenModel = this.node().screenModel;
        var kRound = 10000;
        var circleAttrs = {
            fill: ((d) => screenModel.color(d)),
            class: ((d) => `${prefix} ${screenModel.class(d)}`)
        };
        var circleTransAttrs = {
            r: ((d) => (Math.round(kRound * screenModel.size(d) / 2) / kRound)),
            cx: ((d) => screenModel.x(d)),
            cy: ((d) => screenModel.y(d))
        };

        var updateGroups = function () {

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

                    self.node().subscribe(dots);
                });

            transition(this)
                .attr('opacity', 1);
        };

        var groups = utils.groupBy(fullData, screenModel.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var frameGroups = options.container
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

        self.node().subscribe(
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
    }
};

export {Point};