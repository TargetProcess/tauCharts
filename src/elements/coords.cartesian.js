import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {TMatrix} from '../matrix';

export class Cartesian {

    constructor(config) {
        super();

        this.config = config;

        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                showGridLines: 'xy',
                padding: {l: 50, r: 0, t: 0, b: 50}
            });

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = _.defaults(
            this.config.guide.x,
            {
                cssClass: 'x axis',
                textAnchor: 'middle',
                padding: 10,
                hide: false,
                scaleOrient: 'bottom',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            }
        );

        this.config.guide.x.label = _.defaults(
            this.config.guide.x.label,
            {
                text: 'X',
                rotate: 0,
                padding: 40,
                textAnchor: 'middle'
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = _.defaults(
            this.config.guide.y,
            {
                cssClass: 'y axis',
                textAnchor: 'start',
                padding: 10,
                hide: false,
                scaleOrient: 'left',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

        this.config.guide.y.label = _.defaults(
            this.config.guide.y.label,
            {
                text: 'Y',
                rotate: -90,
                padding: 20,
                textAnchor: 'middle'
            }
        );

        var unit = this.config;
        if (unit.guide.autoLayout === 'extract-axes') {
            var containerBox = unit.options.container.node().getBBox();
            var guide = unit.guide = unit.guide || {};
            guide.x.hide = ((unit.options.top + unit.options.height) < containerBox.height);
            guide.y.hide = ((unit.options.left > 0));
        }
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        this.x = this.xScale = fnCreateScale('pos', node.x, [0, W]);
        this.y = this.yScale = fnCreateScale('pos', node.y, [H, 0]);

        node.x = this.xScale;
        node.y = this.yScale;

        node.x.scaleObj = this.xScale;
        node.y.scaleObj = this.yScale;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

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

    drawFrames(frames, continuation) {
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

                frame.unit.map((u) => continuation(mapper(u), frame));

                return memo.concat(frame.unit.map(mapper));
            },
            []);
    }
}