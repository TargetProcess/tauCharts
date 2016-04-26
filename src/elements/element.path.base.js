import {Element} from './element';
import {PathModel} from '../models/path';
import {elementDecoratorShowText} from './decorators/show-text';
import {elementDecoratorShowAnchors} from './decorators/show-anchors';
import {CSS_PREFIX} from '../const';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class BasePath extends Element {

    constructor(config, decorators) {

        super(config);

        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide = _.defaults(
            this.config.guide,
            {
                cssClass: '',
                widthCssClass: '',
                showAnchors: true,
                anchorSize: 0.1,
                color: {},
                text: {}
            }
        );

        this.config.guide.text = _.defaults(
            this.config.guide.text,
            {
                fontSize: 11,
                paddingX: 0,
                paddingY: 0
            });

        this.config.guide.color = _.defaults(this.config.guide.color || {}, {fill: null});

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 2,
                defMaxSize: (this.isEmptySize ? 6 : 40)
            });

        this.decorators = []
            .concat([
                PathModel.decorator_orientation,
                PathModel.decorator_group,
                PathModel.decorator_size,
                PathModel.decorator_color
            ])
            .concat(decorators)
            .concat(PathModel.adjustSizeScale);

        this.on('highlight', (sender, e) => this.highlight(e));
        this.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        if (this.config.guide.showAnchors) {
            var activate = ((sender, e) => sender.fire('highlight-data-points', (row) => (row === e.data)));
            var deactivate = ((sender) => sender.fire('highlight-data-points', () => (false)));
            this.on('mouseover', activate);
            this.on('mousemove', activate);
            this.on('mouseout', deactivate);
        }
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});
        this.text = fnCreateScale('text', config.text, {});
        this.split = fnCreateScale('split', config.split, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('split', this.split)
            .regScale('text', this.text);
    }

    buildModel({colorScale, textScale}) {

        var pathModel = this.walkFrames();

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;

        var baseModel = {
            scaleX: pathModel.scaleX,
            scaleY: pathModel.scaleY,
            scaleColor: colorScale,
            scaleText: textScale,
            x: pathModel.xi,
            y: pathModel.yi,
            y0: pathModel.y0,
            size: pathModel.size,
            group: pathModel.group,
            color: (d) => colorScale.toColor(pathModel.color(d)),
            class: (d) => colorScale.toClass(pathModel.color(d)),
            matchRowInCoordinates() {
                throw 'Not implemented';
            },
            groupAttributes: {},
            pathAttributes: {},
            pathElement: null,
            dotAttributes: {
                r: (d) => baseModel.size(d) / 2,
                cx: (d) => baseModel.x(d),
                cy: (d) => baseModel.y(d),
                fill: (d) => baseModel.color(d),
                class: (d) => (`${pointPref} ${baseModel.class(d)}`)
            }
        };

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2));
    }

    walkFrames() {

        var args = {
            textScale: this.text,
            defMin: this.config.guide.size.defMinSize,
            defMax: this.config.guide.size.defMaxSize,
            minLimit: this.config.guide.size.minSize,
            maxLimit: this.config.guide.size.maxSize
        };

        return this
            .decorators
            .filter(x => x)
            .reduce(((model, transform) => transform(model, args)), (new PathModel({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleSize: this.size,
                scaleColor: this.color,
                scaleSplit: this.split
            })));
    }

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);

        var model = this.buildModel({
            colorScale: this.color,
            textScale: this.text
        });
        this.model = model;

        var updateGroupContainer = function () {

            this.attr(model.groupAttributes);

            var points = this
                .selectAll('circle')
                .data((fiber) => (fiber.length <= 1) ? fiber : []);
            points
                .exit()
                .remove();
            points
                .attr(model.dotAttributes);
            points
                .enter()
                .append('circle')
                .attr(model.dotAttributes);

            self.subscribe(points, (d) => d);

            var series = this
                .selectAll(model.pathElement)
                .data((fiber) => (fiber.length > 1) ? [fiber] : []);
            series
                .exit()
                .remove();
            series
                .attr(model.pathAttributes);
            series
                .enter()
                .append(model.pathElement)
                .attr(model.pathAttributes);

            self.subscribe(series, function (rows) {
                var m = d3.mouse(this);
                return model.matchRowInCoordinates(rows, {x: m[0], y: m[1]});
            });

            if (guide.color.fill && !model.scaleColor.dim) {
                this.style({
                    fill: guide.color.fill,
                    stroke: guide.color.fill
                });
            }

            if (guide.showAnchors) {
                self.subscribe(elementDecoratorShowAnchors({
                    xScale: model.scaleX,
                    yScale: model.scaleY,
                    guide,
                    container: this
                }));
            }

            if (model.scaleText.dim) {
                self.subscribe(elementDecoratorShowText({
                    guide,
                    xScale: model.scaleX,
                    yScale: model.scaleY,
                    textScale: model.scaleText,
                    container: this
                }));
            }
        };

        var groups = _.groupBy(fullData, model.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var frameGroups = options
            .container
            .selectAll(`.frame-${options.uid}`)
            .data(fibers);
        frameGroups
            .exit()
            .remove();
        frameGroups
            .call(updateGroupContainer);
        frameGroups
            .enter()
            .append('g')
            .call(updateGroupContainer);
    }

    highlight(filter) {

        var container = this.config.options.container;

        container
            .selectAll('.i-role-path')
            .classed({
                'graphical-report__highlighted': ((fiber) => filter(fiber[0]) === true),
                'graphical-report__dimmed': ((fiber) => filter(fiber[0]) === false)
            });

        container
            .selectAll('.i-role-dot')
            .classed({
                'graphical-report__highlighted': ((d) => filter(d) === true),
                'graphical-report__dimmed': ((d) => filter(d) === false)
            });
    }

    highlightDataPoints(filter) {
        const cssClass = 'i-data-anchor';
        this.config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (d) => (filter(d) ? (this.model.size(d) / 2) : this.config.guide.anchorSize),
                fill: (d) => this.model.color(d),
                class: (d) => (`${cssClass} ${this.model.class(d)}`)
            });
    }
}