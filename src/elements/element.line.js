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
                cssClass: 'i-role-datum',
                widthCssClass: '',
                anchors: false
            }
        );

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

        var d3Line = d3.svg
            .line()
            .x((d) => xScale(d[xScale.dim]))
            .y((d) => yScale(d[yScale.dim]));

        if (guide.interpolate) {
            d3Line.interpolate(guide.interpolate);
        }

        var createEventHandler = (eventName) => {
            return function (d) {
                var e = d3.event;
                var m = d3.mouse(this);
                var x = xScale.invert(m[0]);
                var y = yScale.invert(m[1]);
                // find nearest record
                // console.log(d, e, 'X:', x, 'Y:', y);
                // self.fire(eventName, {data: d, event: d3.event});
            }
        };

        var linePref = `${CSS_PREFIX}line i-role-element line ${widthCss} ${countCss} ${guide.cssClass}`;
        var updateLines = function () {
            var path = this
                .selectAll('path')
                .data(({data: frame}) => [frame.data]);
            path.exit()
                .remove();
            path.attr('d', d3Line);
            path.enter()
                .append('path')
                .attr('d', d3Line);

            path.on('mouseover', createEventHandler('mouseover'))
                .on('mouseout', createEventHandler('mouseout'))
                .on('click', createEventHandler('click'));
        };

        var pointPref = `${CSS_PREFIX}dot-line dot-line i-role-element ${CSS_PREFIX}dot `;
        var updatePoints = function () {

            var points = this
                .selectAll('circle')
                .data(frame => frame.data.data.map(item => ({data: item, uid: options.uid})));
            var attr = {
                r: ({data:d}) => sizeScale(d[sizeScale.dim]),
                cx: ({data:d}) => xScale(d[xScale.dim]),
                cy: ({data:d}) => yScale(d[yScale.dim]),
                class: ({data:d}) => (`${pointPref} ${colorScale(d[colorScale.dim])}`)
            };
            points
                .exit()
                .remove();
            points
                .attr(attr);
            points
                .enter()
                .append('circle')
                .attr(attr);
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
}