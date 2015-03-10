import {CSS_PREFIX} from '../const';

export class Point {

    constructor(config) {
        this.config = config;

        this.config.guide = this.config.guide || {};

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = _.defaults(
            this.config.guide.x,
            {
                tickFontHeight: 0,
                density: 20
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = _.defaults(
            this.config.guide.y,
            {
                tickFontHeight: 0,
                density: 20
            }
        );
    }

    drawLayout(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});

        var fitSize = (w, h, maxRelLimit, srcSize, minimalSize) => {
            var minRefPoint = Math.min(w, h);
            var minSize = minRefPoint * maxRelLimit;
            return Math.max(minimalSize, Math.min(srcSize, minSize));
        };

        var width = config.options.width;
        var height = config.options.height;
        var g = config.guide;
        var minimalSize = 1;
        var maxRelLimit = 0.035;
        var isNotZero = (x) => x !== 0;
        var minFontSize = _.min([g.x.tickFontHeight, g.y.tickFontHeight].filter(isNotZero)) * 0.5;
        var minTickStep = _.min([g.x.density, g.y.density].filter(isNotZero)) * 0.5;

        this.size = fnCreateScale(
            'size',
            config.size,
            {
                min: fitSize(width, height, maxRelLimit, 2, minimalSize),
                max: fitSize(width, height, maxRelLimit, minTickStep, minimalSize),
                mid: fitSize(width, height, maxRelLimit, minFontSize, minimalSize)
            });

        return this;
    }

    drawFrames(frames) {

        var options = this.config.options;

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var cScale = this.color;
        var sScale = this.size;

        var enter = function () {
            return this
                .attr({
                    r: (d) => sScale(d[sScale.dim]),
                    cx: (d) => xScale(d[xScale.dim]),
                    cy: (d) => yScale(d[yScale.dim]),
                    class: (d) => `${prefix} ${cScale(d[cScale.dim])}`
                })
                .transition()
                .duration(500)
                .attr('r', (d) => sScale(d[sScale.dim]));
        };

        var update = function () {
            return this
                .attr({
                    r: (d) => sScale(d[sScale.dim]),
                    cx: (d) => xScale(d[xScale.dim]),
                    cy: (d) => yScale(d[yScale.dim]),
                    class: (d) => `${prefix} ${cScale(d[cScale.dim])}`
                });
        };

        var updateGroups = function () {

            this.attr('class', (f) => `frame-id-${options.uid} frame-${f.hash}`)
                .call(function () {
                    var points = this
                        .selectAll('circle')
                        .data((frame) => frame.data);
                    points
                        .exit()
                        .remove();
                    points
                        .call(update);
                    points
                        .enter()
                        .append('circle')
                        .call(enter);
                });
        };

        var mapper = (f) => ({tags: f.key || {}, hash: f.hash(), data: f.take()});

        var frameGroups = options.container
            .selectAll('.frame-id-' + options.uid)
            .data(frames.map(mapper), (f) => f.hash);
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
}