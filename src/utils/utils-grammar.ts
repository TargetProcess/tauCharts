import {Unit, GrammarModel} from '../definitions';

export const syntheticRecordField = 'taucharts_synthetic_record';

export function isNonSyntheticRecord(row) {
    return (row[syntheticRecordField] !== true);
}

export function shouldFillGaps(config: Unit, model: GrammarModel) {
    const isStack = config.stack;
    const isXTimeInterval = (config.guide.x.timeInterval || config.guide.x.tickPeriod);
    const isYValue = model.scaleY.scaleType === 'linear';
    return (isStack || (isXTimeInterval && isYValue));
}
