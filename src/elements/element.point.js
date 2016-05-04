import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {PointModel} from '../models/point';
import {default as _} from 'underscore';

export class Point extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = this.config.guide || {};

        var defaultMinLimit = 10;
        // TODO: fix when pass scales to constructor
        var defaultMaxLimit = this.isEmptySize ? 10 : 40;

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: defaultMinLimit,
                defMaxSize: defaultMaxLimit,
                enableDistributeEvenly: true
            });

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        this.isHorizontal = false;

        var distributeEvenly = !this.isEmptySize && config.guide.size.enableDistributeEvenly;
        this.decorators = [
            PointModel.decorator_orientation,
            PointModel.decorator_group,
            PointModel.decorator_dynamic_size,
            PointModel.decorator_color,
            config.adjustPhase && (distributeEvenly ?
                PointModel.adjustFlexSizeScale :
                PointModel.adjustStaticSizeScale)
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

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
            .regScale('color', this.color);
    }

    buildModel({colorScale, frames}) {

        var pointModel = this.walkFrames(frames);

        return {
            x: this.isHorizontal ? pointModel.yi : pointModel.xi,
            y: this.isHorizontal ? pointModel.xi : pointModel.yi,
            size: pointModel.size,
            group: pointModel.group,
            color: (d) => colorScale.toColor(pointModel.color(d)),
            class: (d) => colorScale.toClass(pointModel.color(d))
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
            .reduce(((model, transform) => transform(model, args)), (new PointModel({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleColor: this.color,
                scaleSize: this.size
            })));
    }

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);

        var model = this.buildModel({
            frames: frames,
            xScale: this.xScale,
            yScale: this.yScale,
            colorScale: this.color,
            sizeScale: this.size
        });

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