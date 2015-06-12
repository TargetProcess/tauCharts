import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
/* jshint ignore:end */

var map_value = (dimType) => {
    return (dimType === 'date') ?
        ((v) => (new Date(v)).getTime()) :
        ((v) => v);
};

var generateHashFunction = (varSet, interval) => utils.generateHash([varSet, interval].map(JSON.stringify).join(''));

export class BaseScale {

    constructor(xSource, scaleConfig) {

        var data;
        if (_.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {
            data = xSource.partByDims(scaleConfig.fitToFrameByDims);
        } else {
            data = xSource.full();
        }

        var vars = this.getVarSet(data, scaleConfig);

        if (scaleConfig.order) {
            vars = _.union(_.intersection(scaleConfig.order, vars), vars);
        }

        this.vars = vars;
        this.scaleConfig = scaleConfig;
    }

    toBaseScale(func, dynamicProps = null) {

        func.dim        = this.scaleConfig.dim;
        func.scaleDim   = this.scaleConfig.dim;
        func.source     = this.scaleConfig.source;

        func.domain     = (() => this.vars);
        func.getHash    = (() => generateHashFunction(this.vars, dynamicProps));

        return func;
    }

    getVarSet(arr, scale) {
        return _(arr)
            .chain()
            .pluck(scale.dim)
            .uniq(map_value(scale.dimType))
            .value();
    }
}