import {CSS_PREFIX} from './../const';
import {Interval} from './element.interval';
import {IntervalModel} from '../models/interval';
import {TauChartError as Error, errorCodes} from './../error';

export class StackedInterval extends Interval {

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
            config.adjustPhase && enableDistributeEvenly && IntervalModel.decorator_size_distribute_evenly,
            config.adjustPhase && enableColorPositioning && IntervalModel.decorator_discrete_share_size_by_color,
            enableColorPositioning && IntervalModel.decorator_positioningByColor,
            IntervalModel.decorator_dynamic_size,
            IntervalModel.decorator_color,
            config.adjustPhase && IntervalModel.adjustYScale,
            config.adjustPhase && IntervalModel.adjustSizeScale
        ];
    }

    createScales(fnCreateScale) {

        var r = super.createScales(fnCreateScale);

        var stackScale = this.getScale(this.config.flip ? 'x' : 'y');
        if (stackScale.discrete) {
            throw new Error(
                `Stacked field [${stackScale.dim}] should be a number`,
                errorCodes.INVALID_DATA_TO_STACKED_BAR_CHART
            );
        }

        return r;
    }
}