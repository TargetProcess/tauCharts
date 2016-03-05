import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {IntervalModel} from '../models/interval';
import {default as _} from 'underscore';
export class Interval extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(this.config.guide || {}, {prettify: true, enableColorToBarPosition: true});

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = _.defaults(
            this.config.guide.x,
            {
                tickFontHeight: 0,
                density: 20
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = _.defaults(
            this.config.guide.y,
            {
                tickFontHeight: 0,
                density: 20
            }
        );

        this.config.guide.size = (this.config.guide.size || {});

        this.barsGap = 1;
        this.baseCssClass = `i-role-element i-role-datum bar ${CSS_PREFIX}bar`;

        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        this.decorators = [
            IntervalModel.decorator_orientation,
            IntervalModel.decorator_size,
            IntervalModel.decorator_color,
            enableColorPositioning && IntervalModel.decorator_positioningByColor
        ];

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    createScales(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});

        var g = config.guide;
        var isNotZero = (x => x !== 0);
        const halfPart = 0.5;
        var minFontSize = halfPart * _.min([g.x, g.y].map(n => n.tickFontHeight).filter(isNotZero));
        var minTickStep = halfPart * _.min([g.x, g.y].map(n => n.density).filter(isNotZero));

        var notLessThan = ((lim, val) => Math.max(val, lim));

        var sizeGuide = {};
        var baseScale = (config.flip ? this.yScale : this.xScale);
        if (baseScale.discrete) {
            sizeGuide = {
                normalize: true,
                func: 'linear',
                min: g.size.min || (0),
                max: g.size.max || notLessThan(1, minTickStep),
                mid: g.size.mid || notLessThan(1, Math.min(minTickStep, minFontSize))
            };
        } else {
            let defaultSize = 3;
            sizeGuide = {
                normalize: false,
                func: 'linear',
                min: g.size.min || defaultSize,
                max: g.size.max || notLessThan(defaultSize, minTickStep)
            };
            sizeGuide.mid = g.size.mid || sizeGuide.min;
        }

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
        var uid = options.uid;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var sizeScale = this.size;
        var colorScale = this.color;
        var isHorizontal = config.flip || config.guide.flip;
        var prettify = config.guide.prettify;
        var barsGap = this.barsGap;
        var baseCssClass = this.baseCssClass;

        var barModel = this.buildModel({xScale, yScale, sizeScale, colorScale, isHorizontal, barsGap});

        var params = {prettify, xScale, yScale, minBarH: 1, minBarW: 1, baseCssClass};
        var d3Attrs = (isHorizontal ?
            this.toHorizontalDrawMethod(barModel, params) :
            this.toVerticalDrawMethod(barModel, params));

        var updateBar = function () {
            return this.attr(d3Attrs);
        };

        var updateBarContainer = function () {
            this.attr('class', (f) => `frame-id-${uid} frame-${f.hash} i-role-bar-group`);
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
            .selectAll(`.frame-id-${uid}`)
            .data(frames.map((fr)=>({hash: fr.hash(), key: fr.key, values: fr.part(), uid: this.config.options.uid})));
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

    toVerticalDrawMethod({barX, barY, barH, barW, barColor}, {prettify, minBarH, minBarW, yScale, baseCssClass}) {

        var calculateW = ((d) => {
            var w = barW(d);
            if (prettify) {
                w = Math.max(minBarW, w);
            }
            return w;
        });

        return {
            x: (({data: d}) => barX(d) - calculateW(d) * 0.5),
            y: (({data: d}) => {
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
            height: (({data: d}) => {
                var h = barH(d);
                if (prettify) {
                    // decorate for better visual look & feel
                    var y = d[yScale.dim];
                    return (y === 0) ? h : Math.max(minBarH, h);
                } else {
                    return h;
                }
            }),
            width: (({data: d}) => calculateW(d)),
            class: (({data: d}) => `${baseCssClass} ${barColor(d)}`)
        };
    }

    toHorizontalDrawMethod({barX, barY, barH, barW, barColor}, {prettify, minBarH, minBarW, xScale, baseCssClass}) {

        var calculateH = ((d) => {
            var h = barW(d);
            if (prettify) {
                h = Math.max(minBarW, h);
            }
            return h;
        });

        return {
            y: (({data: d}) => barX(d) - calculateH(d) * 0.5),
            x: (({data: d}) => {
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
            height: (({data: d}) => calculateH(d)),
            width: (({data: d}) => {
                var w = barH(d);

                if (prettify) {
                    // decorate for better visual look & feel
                    var x = d[xScale.dim];
                    return (x === 0) ? w : Math.max(minBarH, w);
                } else {
                    return w;
                }
            }),
            class: (({data: d}) => `${baseCssClass} ${barColor(d)}`)
        };
    }

    buildModel({xScale, yScale, isHorizontal, sizeScale, colorScale, barsGap}) {
        var enableColorToBarPosition = this.config.guide.enableColorToBarPosition;
        var args = {
            xScale,
            yScale,
            isHorizontal,
            sizeScale,
            colorScale,
            barsGap,
            categories: (enableColorToBarPosition ? colorScale.domain() : [])
        };

        var barModel = this
            .decorators
            .filter(x => x)
            .reduce(((model, transform) => transform(model, args)), (new IntervalModel()));

        return {
            barX: ((d) => barModel.xi(d)),
            barY: ((d) => Math.min(barModel.y0(d), barModel.yi(d))),
            barH: ((d) => Math.abs(barModel.yi(d) - barModel.y0(d))),
            barW: ((d) => barModel.size(d)),
            barColor: ((d) => barModel.color(d))
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