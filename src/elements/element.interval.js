import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {default as _} from 'underscore';
export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify: true, enableColorToBarPosition: true});
        this.config.guide.size = (this.config.guide.size || {});
        const defaultSize = 3;
        this.config.guide.size.min = (this.config.guide.size.min || defaultSize);
        this.config.guide.size.max = (this.config.guide.size.max || this.config.guide.size.min);
        this.config.guide.size.mid = (this.config.guide.size.mid || this.config.guide.size.min);

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, config.guide.size);

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color);
    }

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var sizeScale = this.size;
        var colorScale = this.color;

        var args = {
            xScale,
            yScale,
            sizeScale,
            colorScale,
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

            self.subscribe(bars, ({data:d}) => d);
        };

        var elements = options
            .container
            .selectAll(`.i-role-bar-group`)
            .data(frames.map((fr)=>({key: fr.key, values: fr.part(), uid: this.config.options.uid})));
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

    _buildVerticalDrawMethod({colorScale, sizeScale, xScale, yScale, height, prettify}) {

        var {calculateBarX, calculateBarY, calculateBarH, calculateBarW} = this._buildDrawMethod(
            {
                baseScale: xScale,
                valsScale: yScale,
                sizeScale,
                colorScale,
                defaultBaseAbsPosition: height
            });

        const minBarH = 1;

        return {
            x: (({data: d}) => calculateBarX(d) - calculateBarW(d) * 0.5),
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

    _buildHorizontalDrawMethod({colorScale, sizeScale, xScale, yScale, prettify}) {

        var {calculateBarX, calculateBarY, calculateBarH, calculateBarW} = this._buildDrawMethod(
            {
                baseScale: yScale,
                valsScale: xScale,
                sizeScale,
                colorScale,
                defaultBaseAbsPosition: 0
            });

        const minBarH = 1;

        return {
            y: (({data: d}) => calculateBarX(d) - calculateBarW(d) * 0.5),
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

    _buildDrawMethod({valsScale, baseScale, sizeScale, colorScale, defaultBaseAbsPosition}) {

        var colorCategories = (this.config.guide.enableColorToBarPosition === true) ? colorScale.domain() : [];
        var colorIndexScale = ((d) => Math.max(0, colorCategories.indexOf(d[colorScale.dim]))); // -1 (not found) to 0
        var colorCategoriesCount = (colorCategories.length || 1);
        var colorIndexScaleKoeff = (1 / colorCategoriesCount);

        const barsGap = 1;

        var baseAbsPos = (valsScale.discrete ?
            (() => defaultBaseAbsPosition) :
            (() => valsScale(Math.max(0, Math.min(...valsScale.domain())))))();

        var space = ((x) => baseScale.stepSize(x) * (colorCategoriesCount / (1 + colorCategoriesCount)));

        var calculateSlotSize = (baseScale.discrete ?
            ((d) => (space(d[baseScale.dim]) * colorIndexScaleKoeff)) :
            ((d) => (sizeScale(d[sizeScale.dim]))));

        var calculateGapSize = (baseScale.discrete ?
            ((slotWidth) => (slotWidth > (2 * barsGap)) ? barsGap : 0) :
            (() => (0)));

        var calculateBarW = (d) => {
            var barSize = calculateSlotSize(d);
            var gapSize = calculateGapSize(barSize);
            return barSize - 2 * gapSize;
        };

        var calculateBarH = ((d) => Math.abs(valsScale(d[valsScale.dim]) - baseAbsPos));

        var calculateBarX = (d) => {
            var dx = d[baseScale.dim];

            var absTickStart = (baseScale(dx) - (space(dx) / 2));

            var relSegmStart = (baseScale.discrete ?
                (colorIndexScale(d) * calculateSlotSize(d)) :
                (0));

            var absBarOffset = (baseScale.discrete ?
                (calculateBarW(d) * 0.5 + barsGap) :
                (0));

            return absTickStart + relSegmStart + absBarOffset;
        };

        var calculateBarY = ((d) => Math.min(baseAbsPos, valsScale(d[valsScale.dim])));

        return {
            calculateBarX,
            calculateBarY,
            calculateBarH,
            calculateBarW
        };
    }

    highlight(filter) {

        this.config
            .options
            .container
            .selectAll('.bar')
            .classed({
                'graphical-report__highlighted': (({data: d}) => filter(d) === true),
                'graphical-report__dimmed': (({data: d}) => filter(d) === false)
            });
    }
}