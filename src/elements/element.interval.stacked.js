import {default as _} from 'underscore';
import {CSS_PREFIX} from './../const';
import {Interval} from './element.interval';
import {IntervalModel} from '../models/interval';
import {TauChartError as Error, errorCodes} from './../error';

export class StackedInterval extends Interval {

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

        this.config.guide.enableColorToBarPosition = false;

        this.barsGap = 0;
        this.baseCssClass = `i-role-element i-role-datum bar bar-stack ${CSS_PREFIX}bar-stacked`;
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

    setupTransformations() {
        var enableColorToBarPosition = this.config.guide.enableColorToBarPosition;
        return [
            IntervalModel.decorator_orientation,
            IntervalModel.decorator_stack,
            IntervalModel.decorator_dynamic_size,
            IntervalModel.decorator_color,
            enableColorToBarPosition && IntervalModel.decorator_positioningByColor
        ];
    }
}