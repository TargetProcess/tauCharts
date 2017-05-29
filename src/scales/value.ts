import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import {
    ScaleConfig
} from '../definitions';

export class ValueScale extends BaseScale {

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        this.addField('scaleType', 'value')
            .addField('georole', scaleConfig.georole);
    }

    create() {
        return this.toBaseScale(((x) => x));
    }
}