import {Unit, GrammarModel} from '../definitions';
import {GrammarRegistry} from '../grammar-registry';

export const syntheticRecordField = 'taucharts_synthetic_record';

export function isNonSyntheticRecord(row) {
    return (row[syntheticRecordField] !== true);
}

export function useFillGapsRule(config: Unit) {
    return (model: GrammarModel) => {
        const isStack = config.stack;
        const isXTimeInterval = (config.guide.x.timeInterval || config.guide.x.tickPeriod);
        const isYValue = model.scaleY.scaleType === 'linear';
        if (isStack || (isXTimeInterval && isYValue)) {
            return GrammarRegistry.get('fillGaps')(model, {
                xPeriod: (config.guide.x.tickPeriod || config.guide.x.timeInterval),
                utc: config.guide.utcTime
            });
        }
        return {};
    };
}
