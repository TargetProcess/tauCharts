import {BaseScale} from './base';
import {default as d3} from 'd3';

export class OrdinalScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        this.addField('scaleType', 'ordinal')
            .addField('discrete', true);
    }

    create(interval) {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var d3Domain = d3.scale.ordinal().domain(varSet);

        var d3Scale = d3Domain.rangePoints(interval, 1);

        var size = Math.max(...interval);

        var fnRatio = (key) => {
            var ratioType = typeof(props.ratio);
            if (ratioType === 'function') {
                return props.ratio(key, size, varSet);
            } else if (ratioType === 'object') {
                return props.ratio[key];
            } else {
                // uniform distribution
                return 1 / varSet.length;
            }
        };

        var scale = (x) => {

            var r;

            if (!props.ratio) {
                r = d3Scale(x);
            } else {
                r = size - varSet.slice(varSet.indexOf(x) + 1).reduce(
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