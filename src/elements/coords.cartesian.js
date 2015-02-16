import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {TMatrix} from '../matrix';

export class Cartesian {

    constructor(config) {
        super();

        this.config = config;
    }

    drawLayout() {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        node.x.scaleObj = node.x.init([0, W]);
        node.y.scaleObj = node.y.init([H, 0]);

        node.x.guide.size = W;
        node.y.guide.size = H;

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', CSS_PREFIX + 'cell ' + 'cell')
            .attr('transform', utilsDraw.translate(L, T))
            .datum({'$where': node.$where});

        if (!node.x.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
        }

        if (!node.y.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
        }

        this.grid = utilsDraw.fnDrawGrid.call(container, node, H, W);
        this.W = W;
        this.H = H;

        return this;
    }

    drawFrames(frames) {
        return frames.map((f) => {
            if (true || !f.key) {
                f.unit.options = {
                    container   : this.grid,
                    left        : 0,
                    top         : 0,
                    width       : this.W,
                    height      : this.H
                };
            }
            return f.unit;
        });
    }
}