import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import * as utils from '../utils/utils';
import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
const d3 = {
    ...d3Array,
    ...d3Scale,
};
import {
    ScaleConfig
} from '../definitions';

export class FillScale extends BaseScale {

    vars: number[];

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars) as [number, number];

        var min = Number.isFinite(props.min) ? props.min : vars[0];
        var max = Number.isFinite(props.max) ? props.max : vars[1];

        vars = [
            Math.min(min, vars[0]),
            Math.max(max, vars[1])
        ];

        this.vars = (props.nice) ? utils.niceZeroBased(vars) : d3.extent(vars);

        var opacityStep = (1 - 0.2) / 9;
        var defBrewer = utils.range(10).map((i) => `rgba(90,180,90,${(0.2 + i * opacityStep).toFixed(2)})`);

        var brewer = props.brewer || defBrewer;

        this.addField('scaleType', 'fill')
            .addField('brewer', brewer);
    }

    isInDomain(x) {
        var domain = this.domain() as [number, number];
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!Number.isNaN(min) && !Number.isNaN(max) && (x <= max) && (x >= min));
    }

    create() {

        var varSet = this.vars;

        var brewer = this.getField('brewer') as string[];

        if (!Array.isArray(brewer)) {
            throw new Error('This brewer is not supported');
        }

        var size = brewer.length;
        var step = (varSet[1] - varSet[0]) / size;
        var domain = utils.range(size - 1).map((i) => i + 1)
            .reduce((memo, i) => memo.concat([varSet[0] + (i * step)]), [] as number[]);

        var func = d3.scaleThreshold<number, string>().domain(domain).range(brewer);

        return this.toBaseScale(func);
    }
}
