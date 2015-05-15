import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

let FuncTypes = {
    sqrt: (x) => Math.sqrt(x),
    linear: (x) => (x)
};

export class SizeScale extends BaseScale {

    create(localProps = {}) {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var p = _.defaults({}, localProps, props, {func: 'sqrt', normalize: false});

        var funType = p.func;
        var minSize = p.min;
        var maxSize = p.max;
        var midSize = p.mid;

        var f = FuncTypes[funType];

        var values = _.filter(varSet, _.isFinite);

        var normalize = props.normalize || localProps.normalize;

        var fnNorm = (normalize) ? ((x, maxX) => (x / maxX)) : (x => x);

        var func;
        if (values.length === 0) {
            func = (x) => fnNorm(midSize, midSize);
        } else {
            var k = 1;
            var xMin = 0;

            var min = Math.min(...values);
            var max = Math.max(...values);

            var len = f(Math.max(...[Math.abs(min), Math.abs(max), max - min]));

            xMin = (min < 0) ? min : 0;
            k = (len === 0) ? 1 : ((maxSize - minSize) / len);

            func = (x) => {

                var numX = (x !== null) ? parseFloat(x) : 0;

                if (!_.isFinite(numX)) {
                    return fnNorm(maxSize, maxSize);
                }

                var posX = (numX - xMin); // translate to positive x domain

                return fnNorm((minSize + (f(posX) * k)), maxSize);
            };
        }

        func.scaleType = 'size';

        return this.toBaseScale(func, localProps);
    }
}