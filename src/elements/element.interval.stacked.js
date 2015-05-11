import {CSS_PREFIX} from '../const';
import {flipHub, drawInterval} from './element.interval.fn';

// Possibly it is better to assign static transformation
// during element registration process
// e.g. some kind of decorators

export class StackedInterval {

    static embedUnitFrameToSpec(cfg, spec) {

        var isHorizontal = cfg.guide.flip;

        var stackedScaleName = isHorizontal ? cfg.x : cfg.y;
        var scale = spec.scales[stackedScaleName];
        var prop = scale.dim;

        var sums = cfg.frames.map((f) => f.take().reduce(((s, d) => (s += d[prop])), 0));
        var maxSum = Math.max(...sums);

        if (!scale.hasOwnProperty('max') || scale.max < maxSum) {
            scale.max = maxSum;
        }
    }

    constructor(config) {
        this.config = config;
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
        var maxRelLimit = 1;
        var isNotZero = (x) => x !== 0;
        var minFontSize = _.min([g.x.tickFontHeight, g.y.tickFontHeight].filter(isNotZero)) * 0.5;
        var minTickStep = _.min([g.x.density, g.y.density].filter(isNotZero)) * 0.5;

        this.size = fnCreateScale(
            'size',
            config.size,
            {
                normalize: true,

                min: fitSize(width, height, maxRelLimit, 2, minimalSize),
                max: fitSize(width, height, maxRelLimit, minTickStep, minimalSize),
                mid: fitSize(width, height, maxRelLimit, minFontSize, minimalSize)
            });

        return this;
    }

    drawFrames(frames) {
        var config = this.config;
        var options = config.options;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var sizeScale = this.size;
        var colorScale = this.color;

        var isHorizontal = config.guide.flip;

        var viewMapper;

        if (isHorizontal) {
            viewMapper = (totals, d) => {
                var x = d[xScale.dim];
                var y = d[yScale.dim];
                var stack = totals[y] = ((totals[y] || 0) + x);
                var size = d[sizeScale.dim];
                var color = d[colorScale.dim];
                return {
                    x: stack,
                    y: y,
                    h: x,
                    w: size,
                    c: color
                };
            };
        } else {
            viewMapper = (totals, d) => {
                var x = d[xScale.dim];
                var y = d[yScale.dim];
                var stack = totals[x] = ((totals[x] || 0) + y);
                var size = d[sizeScale.dim];
                var color = d[colorScale.dim];
                return {
                    x: x,
                    y: stack,
                    h: y,
                    w: size,
                    c: color
                };
            };
        }

        var d3Attrs = this._buildDrawModel(isHorizontal, {xScale, yScale, sizeScale, colorScale});

        var updateBar = function () {
            return this
                .attr(d3Attrs)
                .style('stroke-width', 1)
                .style('stroke', 'rgba(255, 255, 255, 0.5)');
        };

        var uid = options.uid;
        var totals = {};
        var updateGroups = function () {
            this.attr('class', (f) => `frame-id-${uid} frame-${f.hash}`)
                .call(function () {
                    var bars = this
                        .selectAll('.bar')
                        .data((frame) => {
                            // var totals = {}; // if 1-only frame support is required
                            return frame.data.map((d) => ({uid: uid, data: d, view: viewMapper(totals, d)}));
                        });
                    bars
                        .exit()
                        .remove();
                    bars
                        .call(updateBar);
                    bars
                        .enter()
                        .append('rect')
                        .call(updateBar);
                });
        };

        var mapper = (f) => ({tags: f.key || {}, hash: f.hash(), data: f.take()});
        var frameGroups = options.container
            .selectAll(`.frame-id-${uid}`)
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

    _buildDrawModel(isHorizontal, {xScale, yScale, sizeScale, colorScale}) {

        // show at least 1px gap for bar to make it clickable
        var minH = 1;
        // default width for continues scales is 5px
        var minW = 5;
        var relW = 0.5;

        var calculateH;
        var calculateW;
        var calculateY;
        var calculateX;

        if (isHorizontal) {

            calculateW = ((d) => Math.max(minH, Math.abs(xScale(d.x) - xScale(d.x - d.h))));
            calculateH = ((d) => ((yScale.stepSize(d.y) || minW) * relW * sizeScale(d.w)));

            calculateX = ((d) => (xScale(d.x - d.h)));
            calculateY = ((d) => (yScale(d.y) - (calculateH(d) / 2)));

        } else {

            calculateW = ((d) => ((xScale.stepSize(d.x) || minW) * relW * sizeScale(d.w)));
            calculateH = ((d) => Math.max(minH, Math.abs(yScale(d.y) - yScale(d.y - d.h))));

            calculateX = ((d) => (xScale(d.x) - (calculateW(d) / 2)));
            calculateY = ((d) => (yScale(d.y)));

        }

        return {
            x: (({view:d}) => calculateX(d)),
            y: (({view:d}) => calculateY(d)),
            height: (({view:d}) => calculateH(d)),
            width: (({view:d}) => calculateW(d)),
            class: (({view:d}) => `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d.c)}`)
        };
    }
}