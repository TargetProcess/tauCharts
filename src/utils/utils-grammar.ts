import {Unit, GrammarModel} from '../definitions';
import {GrammarRegistry} from '../grammar-registry';

export const syntheticRecordField = 'taucharts_synthetic_record';

export function isNonSyntheticRecord(row) {
    return (row[syntheticRecordField] !== true);
}

export function useFillGapsRule(config: Unit) {
    return (model: GrammarModel) => {
        const isStack = config.stack;
        const xPeriod = model.scaleX.period;
        const isYValue = model.scaleY.scaleType === 'linear';
        const isAuto = (!config.guide.x || config.guide.x.fillGaps == null);
        if (
            (!isAuto && config.guide.x.fillGaps) ||
            (isAuto && (isStack || (xPeriod && isYValue)))
        ) {
            return GrammarRegistry.get('fillGaps')(model, {
                isStack,
                xPeriod,
                utc: config.guide.utcTime
            });
        }
        return {};
    };
}
