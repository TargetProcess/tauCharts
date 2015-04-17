import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class SizeScale extends BaseScale {

    create(localProps = {}) {

        var props = this.scaleConfig;
        var varSet = this.vars;

        var minSize = localProps.min || props.min;
        var maxSize = localProps.max || props.max;
        var midSize = localProps.mid || props.mid;

        var f = (x) => Math.sqrt(x);

        var values = _.filter(varSet, _.isFinite);
        var func;
        if (values.length === 0) {
            func = (x) => midSize;
        } else {
            var k = 1;
            var xMin = 0;

            var min = Math.min.apply(null, values);
            var max = Math.max.apply(null, values);

            var len = f(Math.max.apply(
                null,
                [
                    Math.abs(min),
                    Math.abs(max),
                    max - min
                ]));

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

        func.scaleType = 'size';

        return this.toBaseScale(func, localProps);
    }
}