import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {PointModel} from '../models/point';
import {default as _} from 'underscore';

export class Point extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide.size = (this.config.guide.size || {});

        var defaultMinLimit = 2;
        // TODO: fix when pass scales to constructor
        var defaultMaxLimit = this.isEmptySize ? 10 : 20;

        this.minLimit = config.guide.size.min || defaultMinLimit;
        this.maxLimit = config.guide.size.max || defaultMaxLimit;
        this.fixedSize = config.guide.size.fixed;

        this.decorators = [
            PointModel.decorator_orientation,
            PointModel.decorator_group,
            PointModel.decorator_size,
            PointModel.decorator_color,
            config.adjustPhase && PointModel.adjustSizeScale
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color);
    }

    buildModel({colorScale}) {

        var pointModel = this.walkFrames();

        return {
            x: pointModel.xi,
            y: pointModel.yi,
            size: pointModel.size,
            group: pointModel.group,
            color: (d) => colorScale.toColor(pointModel.color(d)),
            class: (d) => colorScale.toClass(pointModel.color(d))
        };
    }

    walkFrames() {

        var args = {
            xScale: this.xScale,
            yScale: this.yScale,
            colorScale: this.color,
            sizeScale: this.size,
            minLimit: this.minLimit,
            maxLimit: this.maxLimit,
            fixedSize: this.fixedSize,
            dataSource: []
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
            xScale: this.xScale,
            yScale: this.yScale,
            colorScale: this.color,
            sizeScale: this.size
        });

        var attr = {
            r: ((d) => model.size(d) / 2),
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