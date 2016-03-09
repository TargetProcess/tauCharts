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

        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = this.config.guide.size.enableDistributeEvenly;
        this.decorators = [
            IntervalModel.decorator_orientation,
            IntervalModel.decorator_stack,
            enableDistributeEvenly && IntervalModel.decorator_size_distribute_evenly,
            IntervalModel.decorator_dynamic_size,
            IntervalModel.decorator_color,
            enableColorPositioning && IntervalModel.decorator_positioningByColor
        ];
    }
}