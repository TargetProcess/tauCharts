import {CSS_PREFIX} from '../const';

export class Point {

    constructor(config) {
        super();

        this.config = config;
    }

    drawLayout(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0,  config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color  = fnCreateScale('color', config.color, {});
        this.size   = fnCreateScale('size', config.size, {});

        return this;
    }

    drawFrames(frames) {

        var canvas = this.config.options.container;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var cScale = this.color;
        var sScale = this.size;

        var update = function () {

            var props = {
                'r'     : (d) => sScale(d[sScale.dim]),
                'cx'    : (d) => xScale(d[xScale.dim]),
                'cy'    : (d) => yScale(d[yScale.dim]),
                'class' : (d) => `${CSS_PREFIX}dot dot i-role-element i-role-datum ${cScale(d[cScale.dim])}`
            };

            return this.attr(props);
        };

        frames.map((frame) => {
            var elements;
            elements = canvas.selectAll('.dot').data(frame.take());
            elements.call(update);
            elements.exit().remove();
            elements.enter().append('circle').call(update);
        });

        return [];
    }
}