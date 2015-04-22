import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class ValueScale extends BaseScale {

    create() {

        var scale = ((x) => x);
        scale.scaleType = 'value';

        return this.toBaseScale(scale);
    }
}