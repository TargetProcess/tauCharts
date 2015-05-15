import {default as _} from 'underscore';
import {CSS_PREFIX} from '../const';

export class StackedInterval {

    static embedUnitFrameToSpec(cfg, spec) {

        var isHorizontal = cfg.flip;

        var stackedScaleName = isHorizontal ? cfg.x : cfg.y;
        var baseScaleName = isHorizontal ? cfg.y : cfg.x;
        var stackScale = spec.scales[stackedScaleName];
        var baseScale = spec.scales[baseScaleName];
        var baseDim = baseScale.dim;

        var prop = stackScale.dim;

        var sums = cfg.frames.reduce((s0, f) => {
            return f
                .take()
                .reduce(((s, d) => {
                    var stackedVal = d[prop];

                    if ((typeof (stackedVal) !== 'number') || (stackedVal < 0)) {
                        throw new Error(`Stacked field [${prop}] should be a non-negative number`);
                    }

                    var baseVal = d[baseDim];
                    s[baseVal] = s[baseVal] || 0;
                    s[baseVal] += stackedVal;
                    return s;
                }),
                s0);
        }, {});

        var maxSum = Math.max(..._.values(sums));

        if (!stackScale.hasOwnProperty('max') || stackScale.max < maxSum) {
            stackScale.max = maxSum;
        }
    }

    constructor(config) {
        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify:true});
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

                func: 'linear',

                min: 0,
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

        var isHorizontal = config.flip;

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

        var d3Attrs = this._buildDrawModel(
            isHorizontal,
            {
                xScale,
                yScale,
                sizeScale,
                colorScale,
                prettify: config.guide.prettify
            });

        var updateBar = function () {
            return this
                .attr(d3Attrs)
                // TODO: move to CSS styles
                .style('stroke-width', 1)
                .style('stroke', '#fff')
                .style('stroke-opacity', '0.5');
        };

        var uid = options.uid;
        var totals = {};
        var updateGroups = function () {
            this.attr('class', (f) => `frame-id-${uid} frame-${f.hash} i-role-bar-group`)
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

    _buildDrawModel(isHorizontal, {xScale, yScale, sizeScale, colorScale, prettify}) {

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

            calculateW = ((d) => {
                var w = Math.abs(xScale(d.x) - xScale(d.x - d.h));
                if (prettify) {
                    w = Math.max(minH, w);
                }
                return w;
            });

            calculateH = ((d) => {
                var h = ((yScale.stepSize(d.y) || minW) * relW * sizeScale(d.w));
                if (prettify) {
                    h = Math.max(minH, h);
                }
                return h;
            });

            calculateX = ((d) => (xScale(d.x - d.h)));
            calculateY = ((d) => (yScale(d.y) - (calculateH(d) / 2)));

        } else {

            calculateW = ((d) => {
                var w = ((xScale.stepSize(d.x) || minW) * relW * sizeScale(d.w));
                if (prettify) {
                    w = Math.max(minH, w);
                }
                return w;
            });

            calculateH = ((d) => {
                var h = Math.abs(yScale(d.y) - yScale(d.y - d.h));
                if (prettify) {
                    h = Math.max(minH, h);
                }
                return h;
            });

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