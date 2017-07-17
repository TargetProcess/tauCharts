import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import * as d3 from 'd3-scale';
import {
    ScaleConfig
} from '../definitions';

export class OrdinalScale extends BaseScale {

    vars: string[];

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        this.addField('scaleType', 'ordinal')
            .addField('discrete', true);
    }

    create(interval: [number, number]) {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var d3Domain = d3.scalePoint().domain(varSet);

        var d3Scale = d3Domain.range(interval)
            .padding(0.5);

        var size = Math.max(...interval);

        var fnRatio = (key) => {
            if (typeof props.ratio === 'function') {
                return props.ratio(key, size, varSet);
            } else if (typeof props.ratio === 'object') {
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

        (<any>scale).stepSize = (x) => (fnRatio(x) * size);

        return this.toBaseScale(scale, interval);
    }
}
