import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerTitles} from './decorators/layer-titles';
import {default as _} from 'underscore';

export class Point extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = _.defaults(
            (this.config.guide || {}),
            {
                prettify: true,
                enableColorToBarPosition: false
            });

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 10,
                defMaxSize: this.isEmptySize ? 10 : 40, // TODO: fix when pass scales to constructor
                enableDistributeEvenly: !this.isEmptySize
            });

        this.config.guide.text = _.defaults(
            (this.config.guide.text || {}),
            {
                position: ['keep-within-diameter-or-top']
            });

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        this.isHorizontal = false;

        var enableStack = this.config.guide.stack;
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
            CartesianGrammar.decorator_text,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale,
            config.adjustPhase && (enableDistributeEvenly ?
                CartesianGrammar.adjustSigmaSizeScale :
                CartesianGrammar.adjustStaticSizeScale)
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});
        this.split = fnCreateScale('split', config.split, {});
        this.text = fnCreateScale('text', config.text, {});

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
            .regScale('text', this.text);
    }

    buildModel(modelGoG, {colorScale}) {

        return {
            x: this.isHorizontal ? modelGoG.yi : modelGoG.xi,
            y: this.isHorizontal ? modelGoG.xi : modelGoG.yi,
            size: modelGoG.size,
            group: modelGoG.group,
            color: (d) => colorScale.toColor(modelGoG.color(d)),
            class: (d) => colorScale.toClass(modelGoG.color(d))
        };
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
            .reduce(((model, transform) => transform(model, args)), (new CartesianGrammar({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleText: this.text,
                scaleSize: this.size,
                scaleColor: this.color,
                scaleSplit: this.split
            })));
    }

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);

        var modelGoG = this.walkFrames(frames);
        var model = this.buildModel(modelGoG, {colorScale: this.color});

        var kRound = 10000;
        var attr = {
            r: ((d) => (Math.round(kRound * model.size(d) / 2) / kRound)),
            cx: ((d) => model.x(d)),
            cy: ((d) => model.y(d)),
            fill: ((d) => model.color(d)),
            class: ((d) => `${prefix} ${model.class(d)}`)
        };

        var enter = function () {
            return this.attr(attr).transition().duration(500).attr('r', attr.r);
        };

        var update = function () {
            return this.attr(attr);
        };

        var updateGroups = function () {

            this.attr('class', `frame-id-${options.uid}`)
                .call(function () {
                    var dots = this
                        .selectAll('circle')
                        .data((fiber) => fiber);
                    dots.exit()
                        .remove();
                    dots.call(update);
                    dots.enter()
                        .append('circle')
                        .call(enter);

                    self.subscribe(dots);
                });
        };

        var groups = _.groupBy(fullData, model.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var frameGroups = options.container
            .selectAll(`.frame-id-${options.uid}`)
            .data(fibers);
        frameGroups
            .exit()
            .remove();
        frameGroups
            .call(updateGroups);
        frameGroups
            .enter()
            .append('g')
            .call(updateGroups);

        (new LayerTitles(options.container, modelGoG, this.config.flip, this.config.guide.text, options))
            .draw(fibers);

        return [];
    }

    highlight(filter) {
        this.config
            .options
            .container
            .selectAll('.dot')
            .classed({
                'graphical-report__highlighted': ((d) => filter(d) === true),
                'graphical-report__dimmed': ((d) => filter(d) === false)
            });
    }
}