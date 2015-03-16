import {CSS_PREFIX} from '../const';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

export class Line {

    constructor(config) {
        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide = _.defaults(
            this.config.guide,
            {
                cssClass: '',
                anchors: false
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

        var guide = this.config.guide;
        var options = this.config.options;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var sizeScale = this.size;

        var widthCss = getLineClassesByWidth(options.width);
        var countCss = getLineClassesByCount(frames.length);

        var d3Line = d3.svg
            .line()
            .x((d) => xScale(d[xScale.dim]))
            .y((d) => yScale(d[yScale.dim]));

        if (guide.interpolate) {
            d3Line.interpolate(guide.interpolate);
        }

        var linePref = `${CSS_PREFIX}line i-role-element i-role-datum line ${widthCss} ${countCss} ${guide.cssClass}`;
        var updateLines = function () {
            var paths = this
                .selectAll('path')
                .data((frame) => [frame.data]);
            paths
                .exit()
                .remove();
            paths
                .attr('d', d3Line);
            paths
                .enter()
                .append('path')
                .attr('d', d3Line);
        };

        var pointPref = `${CSS_PREFIX}dot-line dot-line i-role-element ${CSS_PREFIX}dot `;
        var updatePoints = function () {

            var points = this
                .selectAll('circle')
                .data((frame) => frame.data);
            points
                .exit()
                .remove();
            points
                .attr({
                    r: (d) => sizeScale(d[sizeScale.dim]),
                    cx: (d) => xScale(d[xScale.dim]),
                    cy: (d) => yScale(d[yScale.dim]),
                    class: (d) => (`${pointPref} ${colorScale(d[colorScale.dim])}`)
                });
            points
                .enter()
                .append('circle')
                .attr({
                    r: (d) => sizeScale(d[sizeScale.dim]),
                    cx: (d) => xScale(d[xScale.dim]),
                    cy: (d) => yScale(d[yScale.dim]),
                    class: (d) => (`${pointPref} ${colorScale(d[colorScale.dim])}`)
                });
        };

        var updateGroups = (x, drawPath, drawPoints) => {

            return function () {

                this.attr('class', (f) => `${linePref} ${colorScale(f.tags[colorScale.dim])} ${x} frame-${f.hash}`)
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
            return {tags: f.key || {}, hash: f.hash(), data: f.take(), uid: options.uid};
        };

        var drawFrame = (tag, id, filter) => {

            var isDrawLine = tag === 'line';
            var isDrawAnchor = !isDrawLine || guide.anchors;

            var frameGroups = options.container
                .selectAll(`.frame-${id}`)
                .data(frames.map(mapper).filter(filter), (f) => f.hash);
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

        drawFrame('line', 'line-' + options.uid, (f) => f.data.length > 1);
        drawFrame('anch', 'anch-' + options.uid, (f) => f.data.length < 2);
    }
}