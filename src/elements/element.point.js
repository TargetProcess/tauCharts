import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {d3_transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';

export class Point extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            (this.config.guide || {}),
            {
                animationSpeed: 0,
                prettify: true,
                enableColorToBarPosition: false
            });

        this.config.guide.size = utils.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 10,
                defMaxSize: this.isEmptySize ? 10 : 40, // TODO: fix when pass scales to constructor
                enableDistributeEvenly: !this.isEmptySize
            });

        this.config.guide.label = utils.defaults(
            (this.config.guide.label || {}),
            {
                position: [
                    'auto:avoid-label-label-overlap',
                    'auto:avoid-label-anchor-overlap',
                    'auto:hide-on-label-label-overlap',
                    'keep-in-box'
                    // 'auto:hide-on-label-edges-overlap'
                ]
            });

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        this.isHorizontal = false;

        var enableStack = this.config.stack;
        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = this.config.guide.size.enableDistributeEvenly;

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            enableStack && CartesianGrammar.decorator_stack,
            enableColorPositioning && CartesianGrammar.decorator_positioningByColor,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale,
            config.adjustPhase && (enableDistributeEvenly ?
                CartesianGrammar.adjustSigmaSizeScale :
                CartesianGrammar.adjustStaticSizeScale)
        ].concat(config.transformModel || []);

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
        this.identity = fnCreateScale('identity', config.identity, {});

        var sortDesc = ((a, b) => {
            var discreteA = a.discrete ? 1 : 0;
            var discreteB = b.discrete ? 1 : 0;
            return (discreteB * b.domain().length) - (discreteA * a.domain().length);
        });

        this.isHorizontal = (this.yScale === [this.xScale, this.yScale].sort(sortDesc)[0]);

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
            defMin: this.defMin,
            defMax: this.defMax,
            minLimit: this.minLimit,
            maxLimit: this.maxLimit,
            isHorizontal: this.isHorizontal,
            dataSource: frames.reduce(((memo, f) => memo.concat(f.part())), [])
        };

        return this
            .decorators
            .filter(x => x)
            .reduce((model, transform) => CartesianGrammar.compose(model, transform(model, args)),
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

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;
        var transition = (sel) => {
            return d3_transition(sel, this.config.guide.animationSpeed);
        };

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);

        var modelGoG = this.walkFrames(frames);
        self.screenModel = modelGoG.toScreenModel();
        var kRound = 10000;
        var circleAttrs = {
            fill: ((d) => self.screenModel.color(d)),
            class: ((d) => `${prefix} ${self.screenModel.class(d)}`)
        };
        var circleTransAttrs = {
            r: ((d) => (Math.round(kRound * self.screenModel.size(d) / 2) / kRound)),
            cx: ((d) => self.screenModel.x(d)),
            cy: ((d) => self.screenModel.y(d))
        };

        var updateGroups = function () {

            this.attr('class', 'frame')
                .call(function () {
                    var dots = this
                        .selectAll('circle')
                        .data((fiber) => fiber, self.screenModel.id);

                    transition(dots.enter().append('circle').attr(circleAttrs))
                        .attr(circleTransAttrs);

                    transition(dots.attr(circleAttrs))
                        .attr(circleTransAttrs);

                    transition(dots.exit())
                        .attr({r: 0})
                        .remove();

                    self.subscribe(dots);
                });

            transition(this)
                .attr('opacity', 1);
        };

        var groups = utils.groupBy(fullData, self.screenModel.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var frameGroups = options.container
            .selectAll('.frame')
            .data(fibers, (f) => self.screenModel.group(f[0]));

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

        self.subscribe(
            new LayerLabels(
                modelGoG,
                this.isHorizontal,
                this.config.guide.label, options
            ).draw(fibers)
        );
    }

    highlight(filter) {

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        var container = this.config.options.container;

        container
            .selectAll('.dot')
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