import {default as _} from 'underscore';
import {CSS_PREFIX} from './../const';
import {Element} from './element';
import {TauChartError as Error, errorCodes} from './../error';

export class StackedInterval extends Element {

    static embedUnitFrameToSpec(cfg, spec) {

        var isHorizontal = cfg.flip;

        var stackedScaleName = isHorizontal ? cfg.x : cfg.y;
        var baseScaleName = isHorizontal ? cfg.y : cfg.x;
        var stackScale = spec.scales[stackedScaleName];
        var baseScale = spec.scales[baseScaleName];
        var baseDim = baseScale.dim;

        var prop = stackScale.dim;

        var groupsSums = cfg.frames.reduce((groups, f) => {
            var dataFrame = f.part();
            var hasErrors = dataFrame.some((d) => (typeof (d[prop]) !== 'number'));
            if (hasErrors) {
                throw new Error(
                    `Stacked field [${prop}] should be a number`,
                    errorCodes.INVALID_DATA_TO_STACKED_BAR_CHART
                );
            }

            dataFrame.reduce(
                (hash, d) => {
                    var stackedVal = d[prop];
                    var baseVal = d[baseDim];
                    var ttl = stackedVal >= 0 ? hash.positive : hash.negative;
                    ttl[baseVal] = ttl[baseVal] || 0;
                    ttl[baseVal] += stackedVal;
                    return hash;
                },
                groups);

            return groups;

        }, {negative: {}, positive: {}});

        var negativeSum = Math.min(..._.values(groupsSums.negative).concat(0));
        var positiveSum = Math.max(..._.values(groupsSums.positive).concat(0));

        if (!stackScale.hasOwnProperty('max') || stackScale.max < positiveSum) {
            stackScale.max = positiveSum;
        }

        if (!stackScale.hasOwnProperty('min') || stackScale.min > negativeSum) {
            stackScale.min = negativeSum;
        }
    }

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify: true});
    }

    createScales(fnCreateScale) {

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

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color);
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

                var item = {
                    y: y,
                    w: d[sizeScale.dim],
                    c: d[colorScale.dim]
                };

                if (x >= 0) {
                    totals.positive[y] = ((totals.positive[y] || 0) + x);
                    item.x = totals.positive[y];
                    item.h = x;
                } else {
                    var prevStack = (totals.negative[y] || 0);
                    totals.negative[y] = (prevStack + x);
                    item.x = prevStack;
                    item.h = Math.abs(x);
                }

                return item;
            };
        } else {
            viewMapper = (totals, d) => {
                var x = d[xScale.dim];
                var y = d[yScale.dim];

                var item = {
                    x: x,
                    w: d[sizeScale.dim],
                    c: d[colorScale.dim]
                };

                if (y >= 0) {
                    totals.positive[x] = ((totals.positive[x] || 0) + y);
                    item.y = totals.positive[x];
                    item.h = y;
                } else {
                    let prevStack = (totals.negative[x] || 0);
                    totals.negative[x] = (prevStack + y);
                    item.y = prevStack;
                    item.h = Math.abs(y);
                }

                return item;
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
        var totals = {
            positive: {},
            negative: {}
        };
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

        var mapper = (f) => ({tags: f.key || {}, hash: f.hash(), data: f.part()});
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