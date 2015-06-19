import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

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