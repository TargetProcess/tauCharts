import {BaseScale} from './base';

export class ValueScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        this.addField('scaleType', 'value')
            .addField('georole', scaleConfig.georole);
    }

    create() {
        return this.toBaseScale(((x) => x));
    }
}