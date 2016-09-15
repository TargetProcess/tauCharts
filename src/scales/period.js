import {BaseScale} from './base';
import {UnitDomainPeriodGenerator} from '../unit-domain-period-generator';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as d3} from 'd3';
/* jshint ignore:end */

export class PeriodScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;

        var domain = d3.extent(vars);
        var min = (props.min === null || props.min === undefined) ? domain[0] : new Date(props.min).getTime();
        var max = (props.max === null || props.max === undefined) ? domain[1] : new Date(props.max).getTime();

        var range = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        var periodGenerator = UnitDomainPeriodGenerator.get(props.period);
        if (props.fitToFrameByDims || (periodGenerator === null)) {
            this.vars = utils.unique(vars.map((x) => new Date(x)), (x) => x.getTime())
                .sort((date1, date2) => date2 - date1);
        } else {
            this.vars = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
        }

        this.addField('scaleType', 'period')
            .addField('period', this.scaleConfig.period)
            .addField('discrete', true);
    }

    isInDomain(aTime) {
        var gen = UnitDomainPeriodGenerator.get(this.scaleConfig.period);
        var val = gen.cast(new Date(aTime)).getTime();
        return (this.domain().map(x => x.getTime()).indexOf(val) >= 0);
    }

    create(interval) {

        var varSet = this.vars;
        var varSetTicks = this.vars.map(t => t.getTime());
        var props = this.scaleConfig;

        var d3Domain = d3.scale.ordinal().domain(varSet);
        var d3Scale = d3Domain.rangePoints(interval, 1);

        var d3DomainTicks = d3.scale.ordinal().domain(varSetTicks.map(String));
        var d3ScaleTicks = d3DomainTicks.rangePoints(interval, 1);

        var size = Math.max(...interval);

        var fnRatio = (key) => {

            var tick = new Date(key).getTime();

            var ratioType = typeof(props.ratio);
            if (ratioType === 'function') {
                return props.ratio(tick, size, varSetTicks);
            } else if (ratioType === 'object') {
                return props.ratio[tick];
            } else {
                // uniform distribution
                return 1 / varSet.length;
            }
        };

        var scale = (x) => {

            var r;
            var dx = new Date(x);
            var tx = dx.getTime();

            if (!props.ratio) {
                r = d3ScaleTicks(String(tx));
            } else {
                r = size - varSetTicks.slice(varSetTicks.indexOf(tx) + 1).reduce(
                        (acc, v) => (acc + (size * fnRatio(v))),
                        (size * fnRatio(x) * 0.5));
            }

            return r;
        };

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.stepSize = (x) => (fnRatio(x) * size);

        return this.toBaseScale(scale, interval);
    }
}