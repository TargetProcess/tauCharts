import {BaseScale} from './base';
import {UnitDomainPeriodGenerator} from '../unit-domain-period-generator';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class PeriodScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;

        // extract: ((x) => UnitDomainPeriodGenerator.get(xOptions.period).cast(new Date(x)))

        var domain = d3.extent(vars);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domain[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domain[1] : new Date(props.max).getTime();

        var range = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        this.vars = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
    }

    create(interval) {

        var varSet = this.vars;

        var d3Domain = d3.scale.ordinal().domain(varSet);

        var d3Scale = d3Domain.rangePoints(interval, 1);

        var size = Math.max(...interval);

        var scale = (x) => d3Scale(new Date(x));

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.scaleType = 'period';
        scale.stepSize = (key) => (size / varSet.length);
        scale.descrete = true;

        return this.toBaseScale(scale, interval);
    }
}