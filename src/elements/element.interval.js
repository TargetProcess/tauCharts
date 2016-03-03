import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {default as _} from 'underscore';
export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify: true, enableColorToBarPosition: true});
        this.config.guide.size = (this.config.guide.size || {});

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});

        const defaultSize = 3;
        var sizeGuide = {min: (this.config.guide.size.min || defaultSize)};
        sizeGuide.max = (this.config.guide.size.max || sizeGuide.min);
        sizeGuide.mid = (this.config.guide.size.mid || sizeGuide.min);
        this.size = fnCreateScale('size', config.size, sizeGuide);

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

        const barsGap = 1;
        var enableColorToBarPosition = this.config.guide.enableColorToBarPosition;
        var args = {
            baseScale,
            valsScale,
            sizeScale,
            colorScale,
            barsGap,
            defaultBaseAbsPosition,
            isHorizontal: (defaultBaseAbsPosition === 0),
            categories: (enableColorToBarPosition ? colorScale.domain() : [])
        };

        var createFunc = ((x) => (() => x));
        var barModel = [
            Interval.decorator_basic,
            Interval.decorator_orientation,
            (baseScale.discrete ?
                Interval.decorator_discrete_size :
                Interval.decorator_continuous_size),
            ((baseScale.discrete && enableColorToBarPosition) ?
                Interval.decorator_discrete_positioningByColor :
                Interval.decorator_identity)
        ].reduce(
            ((model, transformation) => transformation(model, args)),
            {
                y0: createFunc(0),
                yi: createFunc(0),
                xi: createFunc(0),
                size: createFunc(0),
                color: createFunc('')
            });

        return {
            calculateBarX: ((d) => barModel.xi(d)),
            calculateBarY: ((d) => Math.min(barModel.y0(d), barModel.yi(d))),
            calculateBarH: ((d) => Math.abs(barModel.yi(d) - barModel.y0(d))),
            calculateBarW: ((d) => barModel.size(d))
        };
    }

    static decorator_identity(model, {}) {
        return model;
    }

    static decorator_basic(model, {baseScale, valsScale}) {
        var y0 = (valsScale.discrete ?
            (() => valsScale(valsScale.domain()[0])) :
            (() => valsScale(Math.max(0, Math.min(...valsScale.domain())))));

        var yi = ((d) => (valsScale(d[valsScale.dim])));
        var xi = ((d) => (baseScale(d[baseScale.dim])));

        return {y0, yi, xi};
    }

    static decorator_orientation(model, {valsScale, isHorizontal}) {
        var k = (isHorizontal ? (-0.5) : (0.5));
        return {
            y0: (valsScale.discrete ?
                (() => (model.y0() + valsScale.stepSize(valsScale.domain()[0]) * k)) : // (() => defaultBaseAbsPosition)
                (model.y0)),
            yi: model.yi,
            xi: model.xi
        };
    }

    static decorator_continuous_size(model, {sizeScale}) {
        return {
            y0: model.y0,
            yi: model.yi,
            xi: model.xi,
            size: ((d) => (sizeScale(d[sizeScale.dim])))
        };
    }

    static decorator_discrete_size(model, {baseScale, categories, barsGap}) {
        var categoriesCount = (categories.length || 1);
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));
        var fnBarSize = ((d) => (space(d) / categoriesCount));
        var fnGapSize = ((w) => (w > (2 * barsGap)) ? barsGap : 0);

        return {
            y0: model.y0,
            yi: model.yi,
            xi: model.xi,
            size: ((d) => {
                var barSize = fnBarSize(d);
                var gapSize = fnGapSize(barSize);
                return barSize - 2 * gapSize;
            })
        };
    }

    static decorator_discrete_positioningByColor(model, {baseScale, colorScale, categories, barsGap}) {
        var categoriesCount = (categories.length || 1);
        var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[colorScale.dim]))); // -1 (not found) to 0
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));
        var fnBarSize = ((d) => (space(d) / categoriesCount));

        return {
            y0: model.y0,
            yi: model.yi,
            xi: ((d) => {
                var absTickStart = (model.xi(d) - (space(d) / 2));
                var relSegmStart = (colorIndexScale(d) * fnBarSize(d));
                var absBarOffset = (model.size(d) * 0.5 + barsGap);
                return absTickStart + relSegmStart + absBarOffset;
            }),
            size: model.size
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