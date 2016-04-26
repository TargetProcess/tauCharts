import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {IntervalModel} from '../models/interval';
import {default as _} from 'underscore';
export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(
            (this.config.guide || {}),
            {
                prettify: true,
                enableColorToBarPosition: true
            });

        var defaultMinLimit = this.config.guide.prettify ? 3 : 0;
        var defaultMaxLimit = this.config.guide.prettify ? 40 : Number.MAX_VALUE;

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                enableDistributeEvenly: true,
                defMinSize: defaultMinLimit,
                defMaxSize: defaultMaxLimit
            });

        this.baseCssClass = `i-role-element i-role-datum bar ${CSS_PREFIX}bar`;

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = this.config.guide.size.enableDistributeEvenly;
        this.decorators = [
            IntervalModel.decorator_orientation,
            enableColorPositioning && IntervalModel.decorator_positioningByColor,
            config.adjustPhase && enableDistributeEvenly && IntervalModel.decorator_size_distribute_evenly,
            IntervalModel.decorator_dynamic_size,
            IntervalModel.decorator_color,
            config.adjustPhase && IntervalModel.adjustSizeScale
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color);
    }

    walkFrames(frames) {

        var config = this.config;
        var isHorizontal = config.flip || config.guide.flip;
        var args = {
            isHorizontal,
            minLimit: this.minLimit,
            maxLimit: this.maxLimit,
            defMin: this.defMin,
            defMax: this.defMax,
            dataSource: this.convertFramesToData(frames)
        };

        return this
            .decorators
            .filter(x => x)
            .reduce(((model, transform) => transform(model, args)), (new IntervalModel({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleColor: this.color,
                scaleSize: this.size
            })));
    }

    getColorIndex() {
        var colorScale = this.color;
        var colorsOrder = colorScale.domain().reduce((memo, x, i) => {
            memo[x] = i;
            return memo;
        }, {});

        return ((row) => {
            var c = row[colorScale.dim];
            return colorsOrder.hasOwnProperty(c) ? colorsOrder[c] : Number.MAX_VALUE;
        });
    }

    convertFramesToData(frames) {
        var colorIndex = this.getColorIndex();
        return frames
            .reduce(((memo, f) => memo.concat(f.part())), [])
            .sort((a, b) => (colorIndex(a) - colorIndex(b)));
    }

    drawFrames(frames) {

        var self = this;

        var options = this.config.options;
        var uid = options.uid;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var isHorizontal = config.flip || config.guide.flip;
        var prettify = config.guide.prettify;
        var baseCssClass = this.baseCssClass;

        var barModel = this.buildModel({
            colorScale,
            frames: frames
        });

        var params = {prettify, xScale, yScale, minBarH: 1, minBarW: 1, baseCssClass};
        var d3Attrs = (isHorizontal ?
            this.toHorizontalDrawMethod(barModel, params) :
            this.toVerticalDrawMethod(barModel, params));

        var updateBar = function () {
            return this.attr(d3Attrs);
        };

        var updateBarContainer = function () {
            this.attr('class', `frame-id-${uid} i-role-bar-group`);
            var bars = this.selectAll('.bar').data((fiber) => fiber);
            bars.exit()
                .remove();
            bars.call(updateBar);
            bars.enter()
                .append('rect')
                .call(updateBar);

            self.subscribe(bars);
        };

        var groups = _.groupBy(this.convertFramesToData(frames), barModel.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var elements = options
            .container
            .selectAll(`.frame-id-${uid}`)
            .data(fibers);
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

    toVerticalDrawMethod(
        {barX, barY, barH, barW, barColor, barClass},
        {prettify, minBarH, minBarW, yScale, baseCssClass}) {

        var calculateW = ((d) => {
            var w = barW(d);
            if (prettify) {
                w = Math.max(minBarW, w);
            }
            return w;
        });

        return {
            x: ((d) => barX(d) - calculateW(d) * 0.5),
            y: ((d) => {
                var y = barY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = barH(d);
                    var isTooSmall = (h < minBarH);
                    return ((isTooSmall && (d[yScale.dim] > 0)) ? (y - minBarH) : y);
                } else {
                    return y;
                }
            }),
            height: ((d) => {
                var h = barH(d);
                if (prettify) {
                    // decorate for better visual look & feel
                    var y = d[yScale.dim];
                    return (y === 0) ? h : Math.max(minBarH, h);
                } else {
                    return h;
                }
            }),
            width: ((d) => calculateW(d)),
            class: ((d) => `${baseCssClass} ${barClass(d)}`),
            fill: ((d) => barColor(d))
        };
    }

    toHorizontalDrawMethod(
        {barX, barY, barH, barW, barColor, barClass},
        {prettify, minBarH, minBarW, xScale, baseCssClass}) {

        var calculateH = ((d) => {
            var h = barW(d);
            if (prettify) {
                h = Math.max(minBarW, h);
            }
            return h;
        });

        return {
            y: ((d) => barX(d) - calculateH(d) * 0.5),
            x: ((d) => {
                var x = barY(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var h = barH(d);
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
            height: ((d) => calculateH(d)),
            width: ((d) => {
                var w = barH(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var x = d[xScale.dim];
                    return (x === 0) ? w : Math.max(minBarH, w);
                } else {
                    return w;
                }
            }),
            class: ((d) => `${baseCssClass} ${barClass(d)}`),
            fill: ((d) => barColor(d))
        };
    }

    buildModel({colorScale, frames}) {

        var barModel = this.walkFrames(frames);

        return {
            barX: ((d) => barModel.xi(d)),
            barY: ((d) => Math.min(barModel.y0(d), barModel.yi(d))),
            barH: ((d) => Math.abs(barModel.yi(d) - barModel.y0(d))),
            barW: ((d) => barModel.size(d)),
            barColor: ((d) => colorScale.toColor(barModel.color(d))),
            barClass: ((d) => colorScale.toClass(barModel.color(d))),
            group: ((d) => d[colorScale.dim])
        };
    }

    highlight(filter) {

        this.config
            .options
            .container
            .selectAll('.bar')
            .classed({
                'graphical-report__highlighted': ((d) => filter(d) === true),
                'graphical-report__dimmed': ((d) => filter(d) === false)
            });
    }
}