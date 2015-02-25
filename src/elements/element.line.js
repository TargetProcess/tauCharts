import {CSS_PREFIX} from '../const';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

export class Line {

    constructor(config) {
        super();

        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide = _.defaults(
            this.config.guide,
            {
                cssClass: ''
            }
        );
    }

    drawLayout(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

        return this;
    }

    drawFrames(frames) {

        var config = this.config;

        var options = this.config.options;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;

        var widthClass = getLineClassesByWidth(options.width);
        var countClass = getLineClassesByCount(frames.length);

        var updateLines = function () {
            // jscs:disable
            this.attr('class', (d) => `${CSS_PREFIX}line i-role-element i-role-datum line ${colorScale(d.key)} ${widthClass} ${countClass} ${config.guide.cssClass}`);
            // jscs:enable
            var paths = this.selectAll('path').data((d) => [d.take()]);
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var drawPoints = function (points) {
            var update = function () {
                return this
                    .attr('r', 1.5)
                    // jscs:disable
                    .attr('class', (d) => `${CSS_PREFIX}dot-line dot-line i-role-element ${CSS_PREFIX}dot i-role-datum ${colorScale(d[colorScale.dim])}`)
                    // jscs:enable
                    .attr('cx', (d) => xScale(d[xScale.dim]))
                    .attr('cy', (d) => yScale(d[yScale.dim]));
            };

            var elements = options.container.selectAll('.dot-line').data(points);
            elements.call(update);
            elements.exit().remove();
            elements.enter().append('circle').call(update);
        };

        var line = d3.svg.line().x((d) => xScale(d[xScale.dim])).y((d) => yScale(d[yScale.dim]));

        if (this.config.guide.interpolate) {
            line.interpolate(this.config.guide.interpolate);
        }

        var updatePaths = function () {
            this.attr('d', line);
        };

        var points = frames.reduce(
            function (points, item) {
                var values = item.take();
                if (values.length === 1) {
                    points.push(values[0]);
                }
                return points;
            },
            []);

        if (points.length > 0) {
            drawPoints(points);
        }

        var lines = options.container.selectAll('.line' + parseInt(Math.random() * 1000)).data(frames);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    }
}