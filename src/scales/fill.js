import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class FillScale extends BaseScale {

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

    create() {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var defBrewer = ['#F5F5F5', '#DCDCDC', '#D3D3D3', '#C0C0C0', '#A9A9A9', '#808080', '#696969', '#000000'];

        var brewer = props.brewer || defBrewer;

        if (!_.isArray(brewer)) {
            throw new Error('This brewer is not supported');
        }

        var size = brewer.length;
        var step = (varSet[1] - varSet[0]) / size;
        var domain = _
            .times((size - 1), (i) => i + 1)
            .reduce((memo, i) => memo.concat([varSet[0] + (i * step)]), []);

        var func = d3.scale.threshold().domain(domain).range(brewer);

        func.scaleType = 'fill';

        return this.toBaseScale(func);
    }
}