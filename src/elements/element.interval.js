import {CSS_PREFIX} from '../const';
import {interval} from './interval';

export class Interval {

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
        var canvas = this.config.options.container;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var color = this.color;
        var sScale = this.size;

        return frames.map((frame) => {
           // frame.take();
            var node = {
                options: {
                    container: canvas,
                    xScale,
                    yScale,
                    color,
                    width:config.options.width,
                    height:config.options.height
                },
                x: xScale,
                y: yScale,
                color: color,
                groupBy() {
                    return d3.nest()
                        .key(function (d) {
                            return d[color.scaleDim];
                        })
                        .entries(frame.take());
                },
                partition() {
                },
                source() {
                }
            };
            interval(node);
            return frame;
        });
    }
}