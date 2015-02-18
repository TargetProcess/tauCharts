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

        this.x = node.x.scaleObj = node.x.init([0, W]);
        this.y = node.y.scaleObj = node.y.init([H, 0]);

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
        var self = this;
        return frames.reduce(
            (memo, frame) => {
                var mapper;
                if (frame.key) {
                    var coordX = self.x(frame.key[self.x.dim]);
                    var coordY = self.y(frame.key[self.y.dim]);

                    var xDomain = self.x.domain();
                    var yDomain = self.y.domain();

                    var xPart = self.W / xDomain.length;
                    var yPart = self.H / yDomain.length;

                    mapper = (unit) => {
                        unit.options = {
                            container   : self.grid,
                            left        : coordX - xPart / 2,
                            top         : coordY - yPart / 2,
                            width       : xPart,
                            height      : yPart
                        };
                        return unit;
                    };
                }
                else {
                    mapper = (unit) => {
                        unit.options = {
                            container   : self.grid,
                            left        : 0,
                            top         : 0,
                            width       : self.W,
                            height      : self.H
                        };
                        return unit;
                    };
                }

                return memo.concat(frame.unit.map(mapper));
            },
            []);
    }
}