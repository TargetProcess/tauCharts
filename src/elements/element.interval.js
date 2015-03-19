import {CSS_PREFIX} from '../const';
import {flipHub, drawInterval} from './element.interval.fn';

export class Interval {

    constructor(config) {
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
        var colorScale = this.color;
        var node = {
            options: {
                container: canvas,
                xScale,
                yScale,
                color: colorScale,
                width: config.options.width,
                height: config.options.height
            },
            x: xScale,
            y: yScale,
            color: colorScale
        };
        var method = flipHub[this.config.flip ? 'FLIP' : 'NORM'];
        var colorIndexScale = (d) => {
            var findIndex = _.findIndex(domain, (value)=> {
                return value === (d.key || {})[colorScale.scaleDim];
            });
            return findIndex === -1 ? 0 : findIndex;
        };
        //  colorScale.scaleDim = node.color.scaleDim;
        var domain = colorScale.domain();
        colorIndexScale.count = () => domain.length || 1;

        var params = method({
            node,
            xScale,
            yScale,
            colorScale,
            colorIndexScale,
            width: config.options.width,
            height: config.options.height,
            defaultSizeParams: {
                tickWidth: 5,
                intervalWidth: 5,
                offsetCategory: 0
            }
        });
        drawInterval(params, canvas, frames.map((fr)=>({key: fr.key, values: fr.data})));
    }
}