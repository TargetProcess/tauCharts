import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {elementDecoratorShowText} from './decorators/show-text';
import {elementDecoratorShowAnchors} from './decorators/show-anchors';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class Line extends Element {

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

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var sizeScale = this.size;
        var textScale = this.text;

        var widthCss = guide.widthCssClass || getLineClassesByWidth(options.width);
        var countCss = getLineClassesByCount(frames.length);

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-element ${datumClass} ${CSS_PREFIX}dot `;
        const linePref = `${CSS_PREFIX}line i-role-element line ${widthCss} ${countCss} ${guide.cssClass} `;

        var d3Line = d3.svg
            .line()
            .x((d) => xScale(d[xScale.dim]))
            .y((d) => yScale(d[yScale.dim]));

        if (guide.interpolate) {
            d3Line.interpolate(guide.interpolate);
        }

        var updateLines = function () {
            var path = this
                .selectAll('path')
                .data(({data: frame}) => [frame.data]);
            path.exit()
                .remove();
            path.attr('d', d3Line)
                .attr('class', datumClass);
            path.enter()
                .append('path')
                .attr('d', d3Line)
                .attr('class', datumClass);

            self.subscribe(path, function (rows) {

                var m = d3.mouse(this);
                var mx = m[0];
                var my = m[1];

                var by = ((prop) => ((a, b) => (a[prop] - b[prop])));
                var dist = ((x0, x1, y0, y1) => Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2)));

                // d3.invert doesn't work for ordinal axes
                var vertices = rows
                    .map((row) => {
                        var rx = xScale(row[xScale.dim]);
                        var ry = yScale(row[yScale.dim]);
                        return {
                            x: rx,
                            y: ry,
                            dist: dist(mx, rx, my, ry),
                            data: row
                        };
                    });

                var pair = d3
                    .range(vertices.length - 1)
                    .map((edge) => {
                        var v0 = vertices[edge];
                        var v1 = vertices[edge + 1];
                        var ab = dist(v1.x, v0.x, v1.y, v0.y);
                        var ax = v0.dist;
                        var bx = v1.dist;
                        var er = Math.abs(ab - (ax + bx));
                        return [er, v0, v1];
                    })
                    .sort(by('0')) // find minimal distance to edge
                    [0]
                    .slice(1);

                return pair.sort(by('dist'))[0].data;
            });

            if (guide.showAnchors && !this.empty()) {

                var anch = elementDecoratorShowAnchors({
                    xScale,
                    yScale,
                    guide,
                    container: this
                });

                self.subscribe(anch);
            }

            if (textScale.dim && !this.empty()) {
                elementDecoratorShowText({
                    guide,
                    xScale,
                    yScale,
                    textScale,
                    container: this
                });
            }
        };

        var updatePoints = function () {

            var dots = this
                .selectAll('circle')
                .data(frame => frame.data.data.map(item => ({data: item, uid: options.uid})));
            var attr = {
                r: ({data:d}) => sizeScale(d[sizeScale.dim]),
                cx: ({data:d}) => xScale(d[xScale.dim]),
                cy: ({data:d}) => yScale(d[yScale.dim]),
                class: ({data:d}) => (`${pointPref} ${colorScale(d[colorScale.dim])}`)
            };
            dots.exit()
                .remove();
            dots.attr(attr);
            dots.enter()
                .append('circle')
                .attr(attr);

            self.subscribe(dots, ({data:d}) => d);
        };

        var updateGroups = (x, isLine) => {

            return function () {

                this.attr('class', ({data: f}) =>
                    `${linePref} ${colorScale(f.tags[colorScale.dim])} ${x} frame-${f.hash}`)
                    .call(function () {
                        if (isLine) {

                            if (guide.color.fill && !colorScale.dim) {
                                this.style({
                                    fill: guide.color.fill,
                                    stroke: guide.color.fill
                                });
                            }

                            updateLines.call(this);
                        } else {
                            updatePoints.call(this);
                        }
                    });
            };
        };

        var mapper = (f) => {
            return {data: {tags: f.key || {}, hash: f.hash(), data: f.part()}, uid: options.uid};
        };

        var drawFrame = (tag, id, filter) => {

            var isDrawLine = tag === 'line';

            var frameGroups = options.container
                .selectAll(`.frame-${id}`)
                .data(frames.map(mapper).filter(filter), ({data: f}) => f.hash);
            frameGroups
                .exit()
                .remove();
            frameGroups
                .call(updateGroups((`frame-${id}`), isDrawLine));
            frameGroups
                .enter()
                .append('g')
                .call(updateGroups((`frame-${id}`), isDrawLine));
        };

        drawFrame('line', 'line-' + options.uid, ({data: f}) => f.data.length > 1);
        drawFrame('anch', 'anch-' + options.uid, ({data: f}) => f.data.length < 2);
    }

    highlight(filter) {

        var container = this.config.options.container;

        container
            .selectAll('.line')
            .classed({
                'graphical-report__highlighted': (({data: d}) => filter(d.tags) === true),
                'graphical-report__dimmed': (({data: d}) => filter(d.tags) === false)
            });

        container
            .selectAll('.dot-line')
            .classed({
                'graphical-report__highlighted': (({data: d}) => filter(d) === true),
                'graphical-report__dimmed': (({data: d}) => filter(d) === false)
            });
    }

    highlightDataPoints(filter) {
        var colorScale = this.color;
        const cssClass = 'i-data-anchor';
        this.config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (d) => (filter(d) ? 3 : this.config.guide.anchorSize),
                class: (d) => (`${cssClass} ${colorScale(d[colorScale.dim])}`)
            });
    }
}