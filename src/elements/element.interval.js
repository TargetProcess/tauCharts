import {CSS_PREFIX} from '../const';
import {flipHub, drawInterval} from './element.interval.fn';

export class Interval {

    constructor(config) {
        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify:true});
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
        var options = this.config.options;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;

        var domain = colorScale.domain();
        var colorIndexScale = (d) => {
            var findIndex = domain.indexOf(d[colorScale.dim]);
            return findIndex === -1 ? 0 : findIndex;
        };
        colorIndexScale.koeff = (1 / ((domain.length || 1) + 1));

        var args = {
            xScale,
            yScale,
            colorScale,
            colorIndexScale,
            width: config.options.width,
            height: config.options.height,
            prettify: config.guide.prettify
        };

        var isHorizontal = config.flip || config.guide.flip;

        var d3Attrs = isHorizontal ? this._buildHorizontalDrawMethod(args) : this._buildVerticalDrawMethod(args);

        var updateBar = function () {
            return this.attr(d3Attrs);
        };

        var updateBarContainer = function () {
            this.attr('class', 'i-role-bar-group');
            var bars = this.selectAll('.bar').data((d) => {
                return d.values.map(item => ({
                    data: item,
                    uid: d.uid
                }));
            });
            bars.exit()
                .remove();
            bars.call(updateBar);
            bars.enter()
                .append('rect')
                .call(updateBar);
        };
        var elements = options
            .container
            .selectAll(`.i-role-bar-group`)
            .data(frames.map((fr)=>({key: fr.key, values: fr.data, uid: this.config.options.uid})));
        elements
            .exit()
            .remove();
        elements
            .call(updateBarContainer);
        elements
            .enter()
            .append('g')
            .call(updateBarContainer);
    }

    _buildVerticalDrawMethod({colorScale, xScale, yScale, colorIndexScale, width, height, prettify}) {

        var {calculateBarX, calculateBarY, calculateBarH, calculateBarW} = this._buildDrawMethod(
            {
                baseScale: xScale,
                valsScale: yScale,
                colorIndexScale,
                defaultBaseAbsPosition: height
            });

        const minBarH = 1;

        return {
            x: (({data: d}) => calculateBarX(d)),
            y: (({data: d}) => {
                var y = calculateBarY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = calculateBarH(d);
                    var isTooSmall = (h < minBarH);
                    return ((isTooSmall && (d[yScale.dim] > 0)) ? (y - minBarH) : y);
                } else {
                    return y;
                }
            }),
            height: (({data: d}) => {
                var h = calculateBarH(d);
                if (prettify) {
                    // decorate for better visual look & feel
                    var y = d[yScale.dim];
                    return (y === 0) ? h : Math.max(minBarH, h);
                } else {
                    return h;
                }
            }),
            width: (({data: d}) => calculateBarW(d)),
            class: (({data: d}) => `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[colorScale.dim])}`)
        };
    }

    _buildHorizontalDrawMethod({colorScale, xScale, yScale, colorIndexScale, width, height, prettify}) {

        var {calculateBarX, calculateBarY, calculateBarH, calculateBarW} = this._buildDrawMethod(
            {
                baseScale: yScale,
                valsScale: xScale,
                colorIndexScale,
                defaultBaseAbsPosition: 0
            });

        const minBarH = 1;

        return {
            y: (({data: d}) => calculateBarX(d)),
            x: (({data: d}) => {
                var x = calculateBarY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = calculateBarH(d);
                    var dx = d[xScale.dim];
                    var offset = 0;

                    if (dx === 0) {offset = 0;}
                    if (dx > 0) {offset = (h);}
                    if (dx < 0) {offset = (0 - minBarH);}

                    var isTooSmall = (h < minBarH);
                    return (isTooSmall) ? (x + offset) : (x);
                } else {
                    return x;
                }
            }),
            height: (({data: d}) => calculateBarW(d)),
            width: (({data: d}) => {
                var w = calculateBarH(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var x = d[xScale.dim];
                    return (x === 0) ? w : Math.max(minBarH, w);
                } else {
                    return w;
                }
            }),
            class: (({data: d}) => `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[colorScale.dim])}`)
        };
    }

    _buildDrawMethod({valsScale, baseScale, colorIndexScale, defaultBaseAbsPosition}) {

        const minBarW = 5;
        const barsGap = 1;

        var baseAbsPos = (() => {
            // TODO: create [.isContinues] property on scale object
            var xMin = Math.min(...valsScale.domain());
            var isXNumber = !isNaN(xMin);

            return (isXNumber) ?
                valsScale(((xMin <= 0) ? 0 : xMin)) :
                defaultBaseAbsPosition;
        })();

        var calculateIntervalWidth = (d) => (baseScale.stepSize(d[baseScale.dim]) * colorIndexScale.koeff) || minBarW;
        var calculateGapSize = (intervalWidth) => (intervalWidth > (2 * barsGap)) ? barsGap : 0;
        var calculateOffset = (d) => (baseScale.stepSize(d[baseScale.dim]) === 0 ? 0 : calculateIntervalWidth(d));

        var calculateBarW = (d) => {
            var intSize = calculateIntervalWidth(d);
            var gapSize = calculateGapSize(intSize);
            return intSize - 2 * gapSize;
        };

        var calculateBarH = ((d) => Math.abs(valsScale(d[valsScale.dim]) - baseAbsPos));

        var calculateBarX = (d) => {
            var dy = d[baseScale.dim];
            var absTickMiddle = baseScale(dy) - ((baseScale.stepSize(dy)) / 2);
            var absBarMiddle = absTickMiddle - (calculateBarW(d) / 2);
            var absBarOffset = (colorIndexScale(d) + 1) * calculateOffset(d);

            return absBarMiddle + absBarOffset;
        };

        var calculateBarY = ((d) => Math.min(baseAbsPos, valsScale(d[valsScale.dim])));

        return {
            calculateBarX,
            calculateBarY,
            calculateBarH,
            calculateBarW
        };
    }
}