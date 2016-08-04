import {BaseScale} from './base';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class LogarithmicScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var isNum = ((num) => (!isNaN(num) && _.isNumber(num)));

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars);

        var min = isNum(props.min) ? props.min : vars[0];
        var max = isNum(props.max) ? props.max : vars[1];

        vars = [
            Math.min(...[min, vars[0]].filter(isNum)),
            Math.max(...[max, vars[1]].filter(isNum))
        ];

        if (props.nice) {
            if (crossesZero(vars)) {
                vars = utils.niceZeroBased(vars);
            } else {
                vars = utils.niceLog10(vars);
            }
        }

        this.vars = vars;

        this.addField('scaleType', 'logarithmic')
            .addField('discrete', false);
    }

    isInDomain(x) {
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!isNaN(min) && !isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval) {

        var vars = this.vars;

        var d3Scale;

        if (crossesZero(vars)) {
            /*eslint-disable */
            console.warn(
                'Logarithmic scale domain cannot cross zero. Falling back to linear scale.'
            );/*eslint-enable */
            d3Scale = d3.scale.linear();
        } else {
            d3Scale = d3.scale.log();
        }

        d3Scale
            .domain(vars)
            .rangeRound(interval, 1);
        d3Scale.stepSize = (() => 0);

        return this.toBaseScale(d3Scale, interval);
    }
}

function crossesZero(domain) {
    return (
        domain[0] === 0 ||
        domain[1] === 0 ||
        domain[0] > 0 !== domain[1] > 0
    );
}
