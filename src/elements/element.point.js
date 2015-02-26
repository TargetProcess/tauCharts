import {CSS_PREFIX} from '../const';

export class Point {

    constructor(config) {
        super();

        this.config = config;
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

        var options = this.config.options;

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var cScale = this.color;
        var sScale = this.size;

        var enter = function () {
            return this
                .attr({
                    r: 0,
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