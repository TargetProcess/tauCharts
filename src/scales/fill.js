import {BaseScale} from './base';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class FillScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars);

        var min = _.isNumber(props.min) ? props.min : vars[0];
        var max = _.isNumber(props.max) ? props.max : vars[1];

        vars = [
            Math.min(min, vars[0]),
            Math.max(max, vars[1])
        ];

        this.vars = (props.autoScale) ? utils.autoScale(vars) : d3.extent(vars);

        var opacityStep = (1 - 0.2) / 9;
        var defBrewer = _.times(10, (i) => `rgba(90,180,90,${(0.2 + i * opacityStep).toFixed(2)})`);

        var brewer = props.brewer || defBrewer;

        this.addField('scaleType', 'fill')
            .addField('brewer', brewer);
    }

    isInDomain(x) {
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!isNaN(min) && !isNaN(max) && (x <= max) && (x >= min));
    }

    create() {

        var varSet = this.vars;

        var brewer = this.getField('brewer');

        if (!_.isArray(brewer)) {
            throw new Error('This brewer is not supported');
        }

        var size = brewer.length;
        var step = (varSet[1] - varSet[0]) / size;
        var domain = _
            .times((size - 1), (i) => i + 1)
            .reduce((memo, i) => memo.concat([varSet[0] + (i * step)]), []);

        var func = d3.scale.threshold().domain(domain).range(brewer);

        return this.toBaseScale(func);
    }
}