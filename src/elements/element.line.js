import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

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
                anchors: false
            }
        );

        this.on('highlight', (sender, e) => this.highlight(e));
        this.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        this.on('mouseover', ((sender, e) =>
            sender.fire('highlight-data-points', (row) => (row === e.data))));

        this.on('mouseout', ((sender, e) =>
            sender.fire('highlight-data-points', (row) => false)));
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

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var sizeScale = this.size;

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

        var createEventHandler = (eventName) => {

            return function (rows) {

                var e = d3.event;
                var m = d3.mouse(this);
                var mx = m[0];
                var my = m[1];

                // d3.invert doesn't work for ordinal axes
                var near = rows
                    .map((row) => {
                        var rx = xScale(row[xScale.dim]);
                        var ry = yScale(row[yScale.dim]);
                        return {
                            x: rx,
                            y: ry,
                            dist: Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2)),
                            data: row
                        };
                    })
                    .sort((a, b) => (a.dist - b.dist)) // asc
                    [0];

                self.fire(eventName, {data: near.data, event: e});
            };
        };

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
            path.on('mouseover', createEventHandler('mouseover'))
                .on('mouseout', createEventHandler('mouseout'))
                .on('click', createEventHandler('click'));

            if (!this.empty()) {
                var stroke = this.style('stroke');
                var anchUpdate = function () {
                    return this
                        .attr({
                            r: 0.1,
                            cx: (d) => xScale(d[xScale.dim]),
                            cy: (d) => yScale(d[yScale.dim]),
                            class: 'i-data-anchor',
                            stroke: stroke
                        });
                };

                var anch = this
                    .selectAll('circle')
                    .data(({data: frame}) => frame.data);
                anch.exit()
                    .remove();
                anch.call(anchUpdate);
                anch.enter()
                    .append('circle')
                    .call(anchUpdate);
                anch.on('mouseover', (d) => self.fire('mouseover', {data: d, event: d3.event}))
                    .on('mouseout', (d) => self.fire('mouseout', {data: d, event: d3.event}))
                    .on('click', (d) => self.fire('click', {data: d, event: d3.event}));
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
            dots.on('mouseover', ({data:d}) => self.fire('mouseover', {data: d, event: d3.event}))
                .on('mouseout', ({data:d}) => self.fire('mouseout', {data: d, event: d3.event}))
                .on('click', ({data:d}) => self.fire('click', {data: d, event: d3.event}));
        };

        var updateGroups = (x, drawPath, drawPoints) => {

            return function () {

                this.attr('class', ({data: f}) =>
                    `${linePref} ${colorScale(f.tags[colorScale.dim])} ${x} frame-${f.hash}`)
                    .call(function () {

                        if (drawPath) {
                            updateLines.call(this);
                        }

                        if (drawPoints) {
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
            var isDrawAnchor = !isDrawLine || guide.anchors;

            var frameGroups = options.container
                .selectAll(`.frame-${id}`)
                .data(frames.map(mapper).filter(filter), ({data: f}) => f.hash);
            frameGroups
                .exit()
                .remove();
            frameGroups
                .call(updateGroups((`frame-${id}`), isDrawLine, isDrawAnchor));
            frameGroups
                .enter()
                .append('g')
                .call(updateGroups((`frame-${id}`), isDrawLine, isDrawAnchor));
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
        this.config
            .options
            .container
            .selectAll('.i-data-anchor')
            .attr('r', (d) => (filter(d) ? 3 : 0.1));
    }
}