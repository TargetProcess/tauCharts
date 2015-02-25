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

        var prefix = `${CSS_PREFIX}dot dot i-role-element i-role-datum`;

        var canvas = this.config.options.container;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var cScale = this.color;
        var sScale = this.size;

        var enter = (frameId) => {
            return function () {
                return this
                    .attr({
                        r: 0,
                        cx: (d) => xScale(d[xScale.dim]),
                        cy: (d) => yScale(d[yScale.dim]),
                        class: (d) => `${prefix} ${cScale(d[cScale.dim])} frame-${frameId}`
                    })
                    .transition()
                    .duration(500)
                    .attr('r', (d) => sScale(d[sScale.dim]));
            };
        };

        var update = (frameId) => {
            return function () {
                return this
                    .attr({
                        r: (d) => sScale(d[sScale.dim]),
                        cx: (d) => xScale(d[xScale.dim]),
                        cy: (d) => yScale(d[yScale.dim]),
                        class: (d) => `${prefix} ${cScale(d[cScale.dim])} frame-${frameId}`
                    });
            };
        };

        frames.map((frame) => {
            var frameKey = frame.hash();
            var elements;
            elements = canvas
                .selectAll(`.frame-${frameKey}`)
                .data(frame.take());
            elements
                .exit()
                .remove();
            elements
                .call(update(frameKey));
            elements
                .enter()
                .append('circle')
                .call(enter(frameKey));
        });

        return [];
    }
}