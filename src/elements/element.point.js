import {CSS_PREFIX} from '../const';

export class Point {

    constructor(config) {
        super();

        this.config = config;

        this.xScale = config.x.init([0,  config.options.width]);
        this.yScale = config.y.init([config.options.height, 0]);
        this.color  = config.color || (() => '');
        this.size   = config.size || (() => 5);
    }

    drawLayout() {
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
            elements = canvas.selectAll('.dot').data(frame.data);
            elements.call(update);
            elements.exit().remove();
            elements.enter().append('circle').call(update);
        });

        return [];
    }
}