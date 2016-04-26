import {BaseScale} from './base';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

let funcTypes = {
    sqrt: (x) => Math.sqrt(x),
    linear: (x) => (x)
};

export class SizeScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var isNum = ((num) => (!isNaN(num) && _.isNumber(num)));

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars);

        var min = isNum(props.min) ? props.min : vars[0];
        var max = isNum(props.max) ? props.max : vars[1];

        this.vars = [
            Math.min(...[min, vars[0]].filter(isNum)),
            Math.max(...[max, vars[1]].filter(isNum))
        ];

        this.addField('scaleType', 'size');
    }

    isInDomain(x) {
        var domain = this.domain().sort();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!isNaN(min) && !isNaN(max) && (x <= max) && (x >= min));
    }

    create() {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var p = _.defaults({}, props, {func: 'sqrt', minSize: 0, maxSize: 1});

        var funType = p.func;
        var minSize = p.minSize;
        var maxSize = p.maxSize;

        var f = funcTypes[funType];

        var values = _.filter(varSet, _.isFinite);

        var func;
        if (values.length === 0) {
            func = (() => maxSize);
        } else {
            var k = 1;
            var xMin = 0;

            var min = Math.min(...values);
            var max = Math.max(...values);

            var len = f(Math.max(Math.abs(min), Math.abs(max), (max - min)));

            xMin = (min < 0) ? min : 0;
            k = (len === 0) ? 1 : ((maxSize - minSize) / len);

            func = (x) => {

                var numX = (x !== null) ? parseFloat(x) : 0;

                if (!_.isFinite(numX)) {
                    return maxSize;
                }

                var posX = (numX - xMin); // translate to positive x domain

                return (minSize + (f(posX) * k));
            };
        }

        return this.toBaseScale(func);
    }
}