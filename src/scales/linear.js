import {BaseScale} from './base';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class LinearScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;

        var domain = (props.autoScale) ? utils.autoScale(vars) : d3.extent(vars);

        var min = _.isNumber(props.min) ? props.min : domain[0];
        var max = _.isNumber(props.max) ? props.max : domain[1];

        this.vars = [
            Math.min(min, domain[0]),
            Math.max(max, domain[1])
        ];
    }

    create(interval) {

        var varSet = this.vars;

        var d3Domain = d3.scale.linear().domain(varSet);

        var d3Scale = d3Domain.rangeRound(interval, 1);
        var scale = (int) => {
            var min = varSet[0];
            var max = varSet[1];
            var x = int;
            if (x > max) {
                x = max;
            }
            if (x < min) {
                x = min;
            }

            return d3Scale(x);
        };

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.scaleType = 'linear';

        return this.toBaseScale(scale, interval);
    }
}