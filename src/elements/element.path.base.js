import {Element} from './element';
import {PathModel} from '../models/path';
import {elementDecoratorShowText} from './decorators/show-text';
import {elementDecoratorShowAnchors} from './decorators/show-anchors';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class BasePath extends Element {

    constructor(config) {

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

        this.decorators = [
            PathModel.decorator_orientation,
            PathModel.decorator_group,
            PathModel.decorator_size,
            PathModel.decorator_color
        ];

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

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('text', this.text);
    }

    buildModel({xScale, yScale, sizeScale, colorScale, textScale, dataSource}) {

        var args = {xScale, yScale, sizeScale, colorScale, dataSource};

        var pathModel = this
            .decorators
            .filter(x => x)
            .reduce(((model, transform) => transform(model, args)), (new PathModel()));

        return {
            scaleX: pathModel.scaleX,
            scaleY: pathModel.scaleY,
            scaleColor: colorScale,
            scaleText: textScale,
            x: pathModel.xi,
            y: pathModel.yi,
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
            dotAttributes: {}
        };
    }

    packFrameData(rows) {
        return rows;
    }

    unpackFrameData(rows) {
        return rows;
    }

    getDistance(mx, my, rx, ry) {
        return Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2));
    }

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);

        var model = this.buildModel({
            xScale: this.xScale,
            yScale: this.yScale,
            sizeScale: this.size,
            colorScale: this.color,
            textScale: this.text
        });
        this.model = model;

        var updateArea = function () {

            var path = this
                .selectAll(model.pathElement)
                .data((fiber) => [self.packFrameData(fiber)]);
            path.exit()
                .remove();
            path.attr(model.pathAttributes);
            path.enter()
                .append(model.pathElement)
                .attr(model.pathAttributes);

            self.subscribe(path, function (rows) {
                var m = d3.mouse(this);
                return model.matchRowInCoordinates(rows, {x: m[0], y: m[1]});
            });
        };

        var updatePoints = function () {

            var dots = this
                .selectAll('circle')
                .data((fiber) => fiber);
            dots.exit()
                .remove();
            dots.attr(model.dotAttributes);
            dots.enter()
                .append('circle')
                .attr(model.dotAttributes);

            self.subscribe(dots, (d) => d);
        };

        var updateGroups = () => {

            return function () {

                this.attr(model.groupAttributes)
                    .call(function (sel) {

                        if (sel.empty()) {
                            return;
                        }

                        var isPlural = (sel.data()[0].length > 1);
                        if (isPlural) {
                            updateArea.call(this);
                        } else {
                            updatePoints.call(this);
                        }

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
                    });
            };
        };

        var groups = _.groupBy(fullData, model.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var drawFrame = (id) => {

            var frameGroups = options.container
                .selectAll(`.frame-${id}`)
                .data(fibers);
            frameGroups
                .exit()
                .remove();
            frameGroups
                .call(updateGroups(`frame-${id}`));
            frameGroups
                .enter()
                .append('g')
                .call(updateGroups(`frame-${id}`));
        };

        drawFrame(options.uid);
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
                r: (d) => (filter(d) ? 3 : this.config.guide.anchorSize),
                fill: (d) => this.model.color(d),
                class: (d) => (`${cssClass} ${this.model.class(d)}`)
            });
    }
}